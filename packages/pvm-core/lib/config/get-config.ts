import fs from 'fs'
import path from 'path'
import { promisify } from 'util'
import vm from 'vm'
import { URL } from 'url'

import Ajv from 'ajv'
import * as TOML from '@iarna/toml'
import { cosmiconfigSync, defaultLoaders } from 'cosmiconfig'
import yaml from 'js-yaml'
import json5 from 'json5'
import { applyPatch } from 'rfc6902'

import { logger } from '../logger'
import httpreq from '../httpreq'
import { wdShell } from '../shell/index'
import defaultConfig from './defaults'
import { cachedRealPath } from '../fs'
import { isPlainObject } from '../utils'
import { loadUpconfFile } from './upconf-data'
import { resolvePvmProvider } from '../plugins/provider'
import { taggedCacheManager, CacheTag, mema } from '../memoize'

import type { Config } from './types'
import type { RecursivePartial } from '../../types/base'
import { getWorktreeRoot, getMainWorktreePath, cwdToGitRelativity } from '../git/worktree'
import { env } from '../env'

export interface GetConfigOpts {
  ref?: string,
  noUpconf?: boolean,
  raw?: boolean,
  noIncludes?: boolean,
}

const readFile = promisify(fs.readFile)

const configCache = taggedCacheManager.make<Config>([CacheTag.pvmConfig])

const allLoaders = {
  ...defaultLoaders,
  '.toml': tomlLoader,
}

function parseConfig(filepath: string, content: string): Record<string, unknown> {
  const loaderKey = path.extname(filepath) || 'noExt'
  const loader = allLoaders[loaderKey]
  if (!loader) {
    throw new Error(`There is no loader for ${loaderKey} extension`)
  }

  return loader(filepath, content)
}

function mergeDefaults<T extends Record<string, any>>(a: T, b: Record<string, any>): T {
  Object.keys(b).forEach(key => {
    if (a[key] === void 0) {
      a[key as keyof T] = b[key]
    } else if (isPlainObject(a[key]) && isPlainObject(b[key])) {
      a[key as keyof T] = mergeDefaults(a[key], b[key])
    }
  })

  return a
}

// вообще это наивно и не совсем корректно
// правильней будет брать тип их схема конфига и приводить к нему в зависимости от самой опции
function sanitizeValue(strValue: string): string | boolean | number {
  if (/^\d+$/.test(strValue)) {
    return Number(strValue)
  }
  if (strValue === 'false') {
    return false
  }
  if (strValue === 'true') {
    return true
  }
  return strValue
}

function setEnvValue(target: Record<string, any>, path: string[], value: any): Record<string, any> {
  let t = target

  for (let i = 0, len = path.length; i < len; i++) {
    const isLast = i === len - 1
    const p = path[i]

    if (!isLast) {
      t[p] = t[p] || {}
      t = t[p]
    } else {
      t[p] = value
    }
  }
  return target
}

// eslint-disable-next-line pvm/no-process-env
export function readEnv(env = process.env): Record<string, string> {
  const result: Record<string, string> = {}

  for (const [key, value] of Object.entries(env)) {
    if (!key.toUpperCase().startsWith('PVM_CONFIG_')) {
      continue
    }

    const configPath = key
      .replace(/^PVM_CONFIG__?/i, '')
      .toLowerCase()
      .split(/__/g)

    setEnvValue(result, configPath, sanitizeValue(value!))
  }

  return result
}

function tomlLoader(_: string, content: string): TOML.JsonMap {
  return TOML.parse(content)
}

const moduleName = 'pvm'

const yamlLoader = (_, contents: string): any => {
  return yaml.safeLoad(contents)
}

const json5Loader = (_, contents: string): any => {
  return json5.parse(contents)
}

function takeOrigin(maybeUrl: string): string {
  try {
    return new URL(maybeUrl).origin
  } catch (e) {
    return ''
  }
}

const loaders = {
  '.js': (filePath: string, contents: string) => {
    if (/^https?:\/\//.test(filePath)) {
      const script = new vm.Script(contents)
      const exports = {}
      const context = {
        module: {
          exports,
        },
        exports,
      }
      script.runInContext(vm.createContext(context, {
        name: 'pvm-config-loader',
        origin: takeOrigin(filePath),
      }), {
        timeout: 10000,
      })
      return context.module.exports // module.exports может быть перезаписан внутри скрипта, поэтому в таком виде
    } else {
      return require(filePath)
    }
  },
  '.json': (_, contents: string) => {
    return JSON.parse(contents)
  },
  '.yml': yamlLoader,
  '.yaml': yamlLoader,
  '.toml': tomlLoader,
  '.json5': json5Loader,
}

function pickLoaderAndLoad(contents: string, contentsPath: string): Record<string, any> {
  const extname = path.extname(contentsPath)
  const loader = loaders[extname]
  if (!loader) {
    throw new Error(`There is no loader for "${extname}" extension`)
  }

  return loader(contentsPath, contents)
}

async function fetchInclude(resolveFromPath: string, remotePath: string): Promise<Record<string, any>> {
  let contents: string | Record<string, unknown>
  if (/^https?:\/\//.test(remotePath)) {
    // @TODO: добавить http кеширование
    const { body } = await httpreq(remotePath)
    contents = body
  } else {
    const realPath = path.resolve(resolveFromPath, remotePath)
    contents = await readFile(realPath, { encoding: 'utf8' })
  }

  if (typeof contents !== 'string') {
    return isPlainObject(contents) ? contents : {}
  }

  return pickLoaderAndLoad(contents, remotePath)
}

async function processInclude(cwd: string, include: string | string[]): Promise<Record<string, any>> {
  const remotePaths: string[] = Array.isArray(include) ? include : [ include ]
  let acc = Object.create(null)
  for (const remotePath of remotePaths) {
    const data = await fetchInclude(cwd, remotePath)
    acc = mergeDefaults(data, acc)
  }
  return acc
}

const compiledSchemaMap = new Map<string, Ajv.ValidateFunction>()

function validateAgainstSchema(config: Config): void {
  let compiledSchema = compiledSchemaMap.get(config.cwd)
  if (!compiledSchema) {
    const ajv = new Ajv()
    const schema = TOML.parse(require('../../config-schema.json'))
    compiledSchema = ajv.compile(schema)
    compiledSchemaMap.set(config.cwd, compiledSchema)
  }

  if (!compiledSchema(config)) {
    logger.fatal(compiledSchema.errors)
    throw new Error('Invalid pvm configuration')
  }
}

function migrateRenderer(parent: Record<string, any>, parentPath: string): void {
  if (typeof parent.renderer === 'string') {
    logger.warn(`Option "${parentPath}.renderer" is map now.`)
    if ((parent.renderer as string).startsWith('builtin.list')) {
      logger.warn(`Rename "${parentPath}.renderer" option to "${parentPath}.renderer.type"`)
      parent.renderer = {
        type: parent.renderer as 'builtin.list' | 'builtin.list-with-packages',
        tag_head_level: 2,
        show_date: true,
      }
    } else {
      throw new Error(
        `You should migrate "${parentPath}.renderer" to new format. There are two types: "commonjs" and "deprecated-plugin". Use "path" option for "commonjs", and "providesPath" for "deprecated-plugin"`
      )
    }
  }
}

export function migrateDeprecated(config: Config): void {
  // @ts-ignore
  if (config.tagging?.unified_tag) {
    logger.warn(`Namespace "tagging.unified_tag" is deprecated. Rename it to "tagging.generic_tag".`)
    // @ts-ignore
    config.tagging.generic_tag = config.tagging.unified_tag

    // @ts-ignore
    if (config.tagging.unified_tag.suffixes) {
      logger.warn('Move "suffixes" option to namespace "tagging" from "tagging.unified_tag".')
      // @ts-ignore
      config.tagging.suffixes = config.tagging.unified_tag.suffixes
      // @ts-ignore
      delete config.tagging.unified_tag.suffixes
    }
    // @ts-ignore
    delete config.tagging.unified_tag
  }

  migrateRenderer(config.changelog, 'changelog')
  migrateRenderer(config.changelog.for_packages, 'changelog.for_packages')

  if ('local_releases' in config) {
    logger.warn('Setting "local_releases" is deprecated in flavor of new seting "release_list"')
  }

  if ('disable_changelog' in config.release) {
    logger.warn('Setting "release.disable_changelog" does nothing. Use "changelog.enabled" instead.')
  }

  if ('path' in config.changelog.for_packages) {
    logger.warn('Setting "changelog.for_packages.path" does nothing. Use "changelog.for_packages.output_dir" instead.')
  }

  if ('recalc_initial' in config.changelog.for_packages) {
    logger.warn('Setting "changelog.for_packages.recalc_initial" does nothing. Remove it.')
  }

  if (config.update && ('include_release_commit' in config.update)) {
    logger.warn('Setting "update.include_release_commit" is obsoleted and deprecated. Get rid of it.')
  }
}

function clearConfigCacheFor(cwd: string): void {
  configCache.clear(cwd)
}

export interface ConfigResult {
  filepath: string | null,
  config: RecursivePartial<Config>,
}

function loadRawConfig(cwd: string, ref: string | undefined = void 0): ConfigResult {
  const cosmicResult = cosmiconfigSync(moduleName, {
    searchPlaces: [
      `.${moduleName}.json`,
      `.${moduleName}.toml`,
      `.${moduleName}.yaml`,
      `.${moduleName}.yml`,
      `.${moduleName}.json5`,
      `.${moduleName}.js`,
      `${moduleName}.config.js`,
      `.${moduleName}rc`,
    ],
    loaders: {
      '.toml': tomlLoader,
      '.json5': json5Loader,
    },
  }).search(cwd)
  if (!cosmicResult || cosmicResult.isEmpty) {
    logger.debug('config file not found or empty')
    return {
      filepath: null,
      config: {},
    }
  }
  logger.debug(`got config from ${cosmicResult.filepath}`)
  if (!ref) {
    return {
      config: cosmicResult.config,
      filepath: path.relative(cwd, cosmicResult.filepath),
    }
  }
  logger.debug(`load config from ${ref} ref`)
  const relativePath = path.relative(cwd, cosmicResult.filepath)
  if (relativePath.startsWith('..')) {
    throw new Error(`Found config ${cosmicResult.filepath} out of working tree. There is no way to resolve config by reference`)
  }
  const contents = wdShell(cwd, `git show ${ref}:${cwdToGitRelativity(cwd, relativePath)}`)

  return {
    filepath: relativePath,
    config: parseConfig(relativePath, contents),
  }
}

function applyUpconf(configLookupDir: string, config: Config): Config {
  // в этом методе брать cwd из конфига нельзя т.к. он может быть еще не готов
  const upconfData = loadUpconfFile(configLookupDir)
  if (upconfData) {
    logger.info('found upconf, apply patch to config..')
    const applyResults = applyPatch(config, upconfData.config_patch)
    let wasError = false
    for (const applyResult of applyResults) {
      if (applyResult) {
        wasError = true
        logger.error(applyResult)
      }
    }
    if (wasError) {
      throw new Error(`Unable to apply config patch from pvm-upconf`)
    }
  }

  return config
}

const forceIgnoreUpconf = new Map<string, boolean>()

export function markUpconfDeleted(cwd: string): void {
  forceIgnoreUpconf.set(cachedRealPath(cwd), true)
  configCache.clear(cwd)
}

function defaultsFromProvider(cwd: string): RecursivePartial<Config> | undefined {
  const provider = resolvePvmProvider(cwd)
  if (!provider) {
    return
  }

  if (provider.pkg.pvm.configDefaults) {
    const configDefaultsPath = path.resolve(provider.path, provider.pkg.pvm.configDefaults)
    if (!fs.existsSync(configDefaultsPath)) {
      throw new Error(`configDefaults from "${provider.pkg.name}" provider path "${provider.pkg.pvm.configDefaults}" not found`)
    }
    const contents = fs.readFileSync(configDefaultsPath, { encoding: 'utf8' })
    return pickLoaderAndLoad(contents, configDefaultsPath)
  }
}

const cachedMainWorktreePath = mema((dir: string) => getMainWorktreePath(dir))
const cachedWorktreeRoot = mema((dir: string) => getWorktreeRoot(dir))

function getConfigImpl(cwd: string, opts: GetConfigOpts = {}): Promise<Config> | Config {
  cwd = cachedRealPath(cwd)
  const worktreeRoot = cachedWorktreeRoot(cwd)
  const relativeCwdPath = path.relative(worktreeRoot, cwd)
  // if cwd if <git root>/package, than consider to search in /package directory in main worktree (not just in root
  // because it might be not the same place as cwd)
  const configLookupDir = path.resolve(cachedMainWorktreePath(cwd), relativeCwdPath)
  const { ref, noUpconf = false, raw = false } = opts
  let config = configCache.get(cwd, opts)
  if (!config) {
    logger.debug(`search config from ${configLookupDir}`)
    const configResult = loadRawConfig(configLookupDir, ref)

    config = configResult.config as Config

    if (!noUpconf && !forceIgnoreUpconf.get(cwd)) {
      config = applyUpconf(configLookupDir, config)
    }

    const postProcessConfig = (config: Config, fromIncludes?: RecursivePartial<Config>): Config => {
      if (!raw) {
        if (fromIncludes) {
          config = mergeDefaults(config, fromIncludes)
        }
        config = mergeDefaults(config, defaultsFromProvider(configLookupDir) || {})
        config = mergeDefaults(config, defaultConfig)
        config.cwd = cwd
        config.configLookupDir = configLookupDir
      }

      migrateDeprecated(config)

      validateAgainstSchema(config)
      if (noUpconf) {
        logger.debug('config read without upconf')
      }
      logger.debug('config.versioning.source is', config.versioning.source)
      logger.debug('config.versioning.unified_versions_for is', JSON.stringify(config.versioning.unified_versions_for))

      configCache.set(cwd, opts, config)

      return config
    }

    if (!raw) {
      config.executionContext = {
        dryRun: false,
        local: false,
      }
      config.filepath = configResult.filepath
      config = mergeDefaults(config, readEnv())
      // process include directive after env
      if (config.include && !opts.noIncludes) {
        return processInclude(cwd, config.include).then(result => {
          return postProcessConfig(config!, result)
        })
      }

      return postProcessConfig(config)
    }
  }

  return config
}

async function getConfig(cwd = env.PVM_CONFIG_SEARCH_FROM || process.cwd(), opts: GetConfigOpts = {}): Promise<Config> {
  return Promise.resolve(getConfigImpl(cwd, opts))
}

function getConfigWithoutIncludes(cwd: string, opts: Omit<GetConfigOpts, 'noIncludes'> = {}): Config {
  return getConfigImpl(cwd, {
    ...opts,
    noIncludes: true,
  }) as Config
}

export default getConfig
export {
  clearConfigCacheFor,
  loadRawConfig,
  getConfigWithoutIncludes,
}
