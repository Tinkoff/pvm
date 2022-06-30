import fs from 'fs'
import path from 'path'
import vm from 'vm'
import { URL } from 'url'

import Ajv from 'ajv'
import * as TOML from '@iarna/toml'
import { cosmiconfigSync, defaultLoaders } from 'cosmiconfig'
import yaml from 'js-yaml'
import json5 from 'json5'
import { applyPatch } from 'rfc6902'

import { logger } from '../logger'
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
import { Pvm } from '../app/index'
import { CONFIG_TOKEN } from '@pvm/tokens-common'

// with high probability this line will be invoked in any api call
// kind a hacky solution
// todo: remove in PVM-264
import '../node-boot'

export interface GetConfigOpts {
  config?: string,
}

const appCache = taggedCacheManager.make<Pvm>([CacheTag.pvmConfig])

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
  if (strValue.startsWith('{') && strValue.endsWith('}') || strValue.startsWith('[') && strValue.endsWith(']')) {
    return JSON.parse(strValue)
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

function fetchInclude(resolveFromPath: string, remotePath: string): Record<string, any> {
  let contents: string | Record<string, unknown>
  if (/^https?:\/\//.test(remotePath)) {
    throw new Error('Http includes are not supported')
  } else {
    const realPath = path.resolve(resolveFromPath, remotePath)
    contents = fs.readFileSync(realPath, { encoding: 'utf8' })
  }

  if (typeof contents !== 'string') {
    return isPlainObject(contents) ? contents : {}
  }

  return pickLoaderAndLoad(contents, remotePath)
}

function processInclude(cwd: string, include: string | string[]): Record<string, any> {
  const remotePaths: string[] = Array.isArray(include) ? include : [ include ]
  let acc = Object.create(null)
  for (const remotePath of remotePaths) {
    const data = fetchInclude(cwd, remotePath)
    acc = mergeDefaults(data, acc)
  }
  return acc
}

const compiledSchemaMap = new Map<string, Ajv.ValidateFunction>()

export function validateAgainstSchema(config: Config): void {
  let compiledSchema = compiledSchemaMap.get(config.cwd)
  if (!compiledSchema) {
    const ajv = new Ajv()
    const schema = TOML.parse(require('@pvm/types/lib/config-schema.json'))
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
  appCache.clear(cwd)
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

// eslint-disable-next-line @typescript-eslint/no-unused-vars
// @ts-ignore
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
  appCache.clear(cwd)
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

/**
 * Only for internal usage. Will be removed after full migration to single entrypoint
 * @param opts
 */
function getAppImpl(opts: {
  config?: string,
  cwd: string,
}): Pvm {
  const cwd = cachedRealPath(opts.cwd)
  const worktreeRoot = cachedWorktreeRoot(cwd)
  const relativeCwdPath = path.relative(worktreeRoot, cwd)
  // if cwd if <git root>/package, than consider to search in /package directory in main worktree (not just in root
  // because it might be not the same place as cwd)
  const configLookupDir = opts.config ?? path.resolve(cachedMainWorktreePath(cwd), relativeCwdPath)
  const cacheKey = { config: configLookupDir }
  let app: Pvm | undefined = appCache.get(cwd, cacheKey)
  if (!app) {
    logger.debug(`search config from ${configLookupDir}`)
    app = new Pvm({
      cwd,
      config: configLookupDir,
    })
    appCache.set(cwd, cacheKey, app)
  }

  return app
}

function getConfigImpl(cwd: string, opts: GetConfigOpts = {}): Config {
  return getAppImpl({ cwd, config: opts.config }).container.get(CONFIG_TOKEN)
}

export function postprocessConfig(config: Config/*, opts: GetConfigOpts */): Config {
  // if (!noUpconf && !forceIgnoreUpconf.get(config.cwd)) {
  //   config = applyUpconf(config.configLookupDir, config)
  // }

  const postProcessConfig = (config: Config, fromIncludes?: RecursivePartial<Config>): Config => {
    if (fromIncludes) {
      config = mergeDefaults(config, fromIncludes)
    }
    config = mergeDefaults(config, defaultsFromProvider(config.configLookupDir) || {})
    config = mergeDefaults(config, defaultConfig)

    migrateDeprecated(config)

    validateAgainstSchema(config)
    /*    if (noUpconf) {
      logger.debug('config read without upconf')
    } */
    logger.debug('config.versioning.source is', config.versioning.source)
    logger.debug('config.versioning.unified_versions_for is', JSON.stringify(config.versioning.unified_versions_for))

    return config
  }

  config.executionContext = {
    dryRun: false,
    local: false,
  }
  config = mergeDefaults(config, readEnv())
  // process include directive after env
  if (config.include) {
    return processInclude(config.cwd, config.include).then(result => {
      return postProcessConfig(config!, result)
    })
  }

  return postProcessConfig(config)
}

function getConfig(cwd = env.PVM_CONFIG_SEARCH_FROM || process.cwd(), opts?: GetConfigOpts): Config {
  return getConfigImpl(cwd, opts)
}

function getApp(cwd = env.PVM_CONFIG_SEARCH_FROM || process.cwd(), opts: GetConfigOpts = {}): Pvm {
  return getAppImpl({ cwd, config: opts.config })
}

/**
 * @deprecated Please use `getConfig` instead
 */
export const getConfigWithoutIncludes = getConfig

export default getConfig
export {
  getApp,
  clearConfigCacheFor,
  loadRawConfig,
}
