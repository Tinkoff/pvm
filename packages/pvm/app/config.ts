import path from 'path'

import Ajv from 'ajv'
import * as TOML from '@iarna/toml'
import { cosmiconfigSync, defaultLoaders } from 'cosmiconfig'
import json5 from 'json5'

import { logger } from '../lib/logger'
import { wdShell } from '../lib/shell/index'
import { isPlainObject } from '../lib/utils'

import type { Config, RecursivePartial } from '../types'
import { cwdToGitRelativity } from '../lib/git/worktree'
import { defaultConfig as rawDefaults } from '../pvm-defaults'

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

export function mergeDefaults<T extends Record<string, any>>(a: T, b: Record<string, any>): T {
  const result = { ...a }

  Object.keys(b).forEach((key: keyof T & string) => {
    if (result[key] === void 0) {
      if (Array.isArray(b[key])) {
        result[key] = [...b[key]] as any
      } else if (isPlainObject(b[key])) {
        result[key] = { ...b[key] }
      } else {
        result[key] = b[key]
      }
    } else if (Array.isArray(a[key]) && Array.isArray(b[key])) {
      result[key] = result[key].concat(b[key])
    } else if (isPlainObject(a[key]) && isPlainObject(b[key])) {
      result[key] = mergeDefaults(a[key], b[key])
    }
  })

  return result as T
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

const json5Loader = (_, contents: string): any => {
  return json5.parse(contents)
}

const compiledSchemaMap = new Map<string, Ajv.ValidateFunction>()

export function validateAgainstSchema(config: Config): void {
  let compiledSchema = compiledSchemaMap.get(config.cwd)
  if (!compiledSchema) {
    const ajv = new Ajv()
    const schema = TOML.parse(require('../types/config-schema.json'))
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

function migratePublishEnabledDisable(config: Config, keyName: 'enabled_only_for' | 'disabled_for'): void {
  let migrated = false

  for (const [i, value] of config.publish[keyName].entries()) {
    // dirA/dirB
    if (!value.startsWith('@') && value.indexOf('/') > 0) {
      // align with locator format
      config.publish[keyName][i] = `/${value}`

      migrated = true
    }
  }

  if (migrated) {
    logger.warn(`Setting "publish.${keyName}" should have list of locators starting with '/' if file path matching required`)
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

  if (config.publish?.enabled_only_for?.length) {
    migratePublishEnabledDisable(config, 'enabled_only_for')
  }

  if (config.publish?.disabled_for?.length) {
    migratePublishEnabledDisable(config, 'disabled_for')
  }

  if (config.slack_notification) {
    config.notifications = config.notifications || {}
    config.notifications.clients_common_config = {
      channel: config.slack_notification.channel,
      ...config.notifications.clients_common_config,
      author: {
        name: config.slack_notification.username,
        avatarEmoji: config.slack_notification.icon_emoji,
        ...config.notifications.clients_common_config?.author,
      },
    }
    delete config.slack_notification
    logger.warn(`Setting "config.slack_notification" is deprecated. Consider to use "config.notifications" section entries.`)
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

export interface ConfigResult {
  filepath: string | null,
  config: RecursivePartial<Config>,
}

export function loadRawConfig(cwd: string, ref: string | undefined = void 0): ConfigResult {
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

function readDefaults(): Config {
  return rawDefaults as Config
}

export const defaultConfig = readDefaults()
