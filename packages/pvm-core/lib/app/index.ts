import path from 'path'
import type { PluginConfig, PluginFactory, Config, RecursivePartial, PluginDeclaration } from '@pvm/types'
import { Container, DI_TOKEN, provide } from '@pvm/di'
import { CLI_TOKEN, CONFIG_TOKEN, CWD_TOKEN } from '@pvm/tokens-core'
import {
  defaultsFromProvider,
  loadRawConfig,
  mergeDefaults,
  migrateDeprecated,
  readEnv,
  validateAgainstSchema,
} from '../config/get-config'
import { defaultConfig } from '../../pvm-defaults'
import { logger, loggerFor } from '../logger'
import { verifyRequiredBins } from './required-bin-versions'
import chalk from 'chalk'

const log = loggerFor('pvm:app')

export function isPlainObject(x: unknown): x is Record<string, unknown> {
  return !!x && !Array.isArray(x) && typeof x === 'object'
}

export class Pvm {
  container: Container
  cwd: string
  configDir: string
  registeredPlugins = new Set<any>()

  constructor(opts: {
    config?: RecursivePartial<Config> | string | null,
    plugins?: PluginConfig[],
    cwd?: string,
  } = {}) {
    const { config, cwd = process.cwd(), plugins = [] } = opts ?? {}

    this.cwd = cwd
    this.configDir = typeof config === 'string' ? config : cwd

    this.container = new Container()

    this.container.register(provide({
      provide: CWD_TOKEN,
      useValue: cwd,
    }))

    this.container.register(provide({
      useValue: this.container,
      provide: DI_TOKEN,
    }))

    this.initConfigAndPlugins(config ?? {}, plugins, cwd)
  }

  runCli(argv: string[] = process.argv): void {
    verifyRequiredBins().then(() => {
      this.container.get(CLI_TOKEN)({
        argv,
      })
    }).catch(e => {
      console.error(e)
      process.exitCode = 1
    })
  }

  protected initConfigAndPlugins(config: RecursivePartial<Config> | string | null, plugins: PluginConfig[] = [], cwd: string) {
    const configExtensions:RecursivePartial<Config>[] = []
    // Env config
    configExtensions.push(readEnv())

    // User defined config
    configExtensions.push(this.setupConfigDirs((typeof config === 'string' || config === undefined) ? loadRawConfig(config).config : config ?? {}, this.cwd, this.configDir))
    let nextConfig = this.mergeConfigExtensions(configExtensions)

    // Config extensions from plugins
    let nextConfigExtensions = this.registerPlugins((plugins ?? []).concat(nextConfig.plugins_v2 ?? []), cwd)
    nextConfig = mergeDefaults(nextConfig, this.mergeConfigExtensions(nextConfigExtensions))
    nextConfigExtensions = []

    const providerConfig = defaultsFromProvider(this.configDir)
    if (providerConfig) {
      // Config extensions from provider itself
      nextConfig = mergeDefaults(nextConfig, providerConfig)
      if (providerConfig.plugins_v2) {
        nextConfigExtensions = this.registerPlugins(providerConfig.plugins_v2, cwd)
        // Config extensions from provider plugins
        nextConfig = mergeDefaults(nextConfig, this.mergeConfigExtensions(nextConfigExtensions))
      }
    }

    if (defaultConfig.plugins_v2) {
      nextConfigExtensions = this.registerPlugins(defaultConfig.plugins_v2, cwd)
      // Config extensions from default config plugins
      nextConfig = mergeDefaults(nextConfig, this.mergeConfigExtensions(nextConfigExtensions))
    }
    // Config extensions from default config itself
    nextConfig = mergeDefaults(nextConfig, defaultConfig)

    migrateDeprecated(nextConfig)

    validateAgainstSchema(nextConfig)

    logger.debug('config.versioning.source is', nextConfig.versioning.source)
    logger.debug('config.versioning.unified_versions_for is', JSON.stringify(nextConfig.versioning.unified_versions_for))

    nextConfig.executionContext = {
      dryRun: false,
      local: false,
    }

    this.container.register(provide({
      useValue: nextConfig,
      provide: CONFIG_TOKEN,
    }))
  }

  private setupConfigDirs(resultConfig: RecursivePartial<Config>, cwd: string, configLookupDir: string) {
    resultConfig.cwd = cwd
    resultConfig.configLookupDir = configLookupDir

    return resultConfig
  }

  protected mergeConfigExtensions(configExtensions: RecursivePartial<Config>[]): Config {
    return configExtensions.reduce((acc, extension) => mergeDefaults(acc, extension), {} as Config) as Config
  }

  protected registerPlugins(plugins: PluginConfig[], resolveRoot: string): RecursivePartial<Config>[] {
    let configExtensions: RecursivePartial<Config>[] = []
    for (const pluginConfig of plugins) {
      const { factory, configExt, resolvedPath } = this.resolvePlugin(pluginConfig, resolveRoot)

      if (factory ? this.registeredPlugins.has(factory) : this.registeredPlugins.has(configExt)) {
        throw new Error(`Plugin ${typeof pluginConfig.plugin === 'string' ? pluginConfig.plugin : pluginConfig.plugin.name} resolved from ${resolveRoot} already registered`)
      }
      this.registeredPlugins.add(factory ?? configExt)
      const pluginProviders = factory ? factory(pluginConfig.options || {}).providers : []
      for (const provider of pluginProviders) {
        this.container.register(provider)
      }
      log.info(chalk`plugin {blue ${resolvedPath}} loaded`)

      if (configExt) {
        configExtensions.push(configExt)
        if (configExt.plugins_v2) {
          configExtensions = configExtensions.concat(this.registerPlugins(configExt.plugins_v2, path.dirname(resolvedPath)))
        }
      }
    }
    return configExtensions
  }

  protected resolvePlugin(pluginConfig: PluginConfig, resolveRoot: string): { factory?: PluginFactory, configExt?: RecursivePartial<Config>, resolvedPath: string } {
    if (typeof pluginConfig.plugin === 'string') {
      const pluginPath = require.resolve(pluginConfig.plugin, { paths: [resolveRoot] })
      const pluginModule = require(pluginPath)
      return { ...((pluginModule.__esModule ? pluginModule.default : pluginModule) as PluginDeclaration), resolvedPath: pluginPath }
    }

    const opts = isPlainObject(pluginConfig.plugin) ? pluginConfig.plugin : { factory: pluginConfig.plugin }

    return { ...opts, resolvedPath: resolveRoot }
  }
}
