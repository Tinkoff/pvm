import path from 'path'
import type { PluginConfig, PluginFactory, Config, RecursivePartial, PluginDeclaration } from '../types'
import { Container, DI_TOKEN, provide } from '../lib/di'
import { CONFIG_TOKEN, CWD_TOKEN, NOTIFICATOR_TOKEN, REPOSITORY_FACTORY_TOKEN } from '../tokens'
import {
  loadRawConfig, mergeDeep,
  migrateDeprecated,
  readEnv,
  validateAgainstSchema,
} from './config'
import { defaultConfig } from '../pvm-defaults'
import { logger, loggerFor } from '../lib/logger'
import chalk from 'chalk'
import { getNewTag } from '../mechanics/add-tag/get-new-tag'
import { loadPkg } from '../lib/pkg'
import getFiles from '../mechanics/files/files'
import type { Notificator } from '../mechanics/notifications'
import { pkgset } from '../mechanics/pkgset/pkgset'
import { getPackages } from '../mechanics/packages'
import { getCurrentRelease } from '../mechanics/releases'
import type { Repository } from '../mechanics/repository'
import { getUpdateState } from '../mechanics/update'
import { download, upload } from '../mechanics/artifacts/pub/artifacts'
import { runCli } from './run-cli'
import providers from './providers'

const log = loggerFor('pvm:app')

export function isPlainObject(x: unknown): x is Record<string, unknown> {
  return !!x && !Array.isArray(x) && typeof x === 'object'
}

// todo: get rid of container passing down to functions
export class Pvm {
  container: Container
  cwd: string
  configDir: string
  pluginFactories = new Map<any, PluginFactory | undefined>()

  constructor(opts: {
    config?: RecursivePartial<Config> | string | null,
    cwd?: string,
  } = {}) {
    const { config, cwd = process.cwd() } = opts ?? {}

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

    providers.forEach(p => this.container.register(p))

    this.initConfigAndPlugins(config)
  }

  /**
   * Runs cli. Used to start pvm as cli app.
   */
  static runCli(Class: typeof Pvm, argv: string[] = process.argv): void {
    return runCli(Class, argv)
  }

  /**
   * Return next release tag name based on previous releases
   */
  public getNewTag(targetRef: string): Promise<string | null> {
    return getNewTag(this.container, targetRef)
  }

  /**
   * Returns result config which will be used in pvm
   */
  public getConfig(): Config {
    return this.container.get(CONFIG_TOKEN)
  }

  public loadPkg(pkgPath: Parameters<typeof loadPkg>[1], opts: Parameters<typeof loadPkg>[2] = {}): ReturnType<typeof loadPkg> {
    opts.cwd = opts.cwd ?? this.cwd

    return loadPkg(this.container.get(CONFIG_TOKEN), pkgPath, opts)
  }

  public getFiles(filesGlob: string | string[], opts: Record<string, any> = {}): Promise<string[]> {
    opts.cwd = opts.cwd ?? this.cwd

    return getFiles(this.container, filesGlob, opts)
  }

  public getNotificator(): Notificator {
    return this.container.get(NOTIFICATOR_TOKEN)
  }

  public getPkgSet(strategy: string, opts: Record<string, any> = {}): ReturnType<typeof pkgset> {
    opts.cwd = opts.cwd ?? this.cwd

    return pkgset(this.container, strategy, opts)
  }

  public getPackages(type: Parameters<typeof getPackages>[1] = 'all', opts: Parameters<typeof getPackages>[2] = {}): ReturnType<typeof getPackages> {
    opts.cwd = opts.cwd ?? this.cwd

    return getPackages(this.container, type, opts)
  }

  public getCurrentRelease(opts: Parameters<typeof getCurrentRelease>[1] = {}): ReturnType<typeof getCurrentRelease> {
    opts.cwd = opts.cwd ?? this.cwd

    return getCurrentRelease(this.container, opts)
  }

  public getRepository(ref?: string): Repository {
    return this.container.get(REPOSITORY_FACTORY_TOKEN)({ ref })
  }

  public getUpdateState(opts: Parameters<typeof getUpdateState>[1] = {}): ReturnType<typeof getUpdateState> {
    opts.cwd = opts.cwd ?? this.cwd

    return getUpdateState(this.container, opts)
  }

  public downloadArtifacts(args: Parameters<typeof download>[1]): ReturnType<typeof download> {
    return download(this.container, args)
  }

  public uploadArtifacts(args: Parameters<typeof upload>[1]): ReturnType<typeof upload> {
    return upload(this.container, args)
  }

  /**
   * Configuration sources priority (from less prioritized):
   * 1. Builtin default pvm config
   * 2. Constructor provided plugins
   * 3. User defined config and plugins
   * 4. Config from environment variables
   *
   * General logic is - collect config and plugins from less prioritized sources to more prioritized. Resolve
   * plugins recursively in-depth from each source and deep merge them in order they resolved. Plugins
   * registered in di after all configurations merged so use allowed to modify plugin configurations introduced
   * at less prioritized sources.
   */
  protected initConfigAndPlugins(config: RecursivePartial<Config> | string | null | undefined): void {
    let nextConfigExtensions: RecursivePartial<Config>[] = []
    // Config extensions from default config itself
    let nextConfig = this.getDefaultConfig()
    if (nextConfig.plugins_v2) {
      nextConfigExtensions = this.resolvePlugins(nextConfig.plugins_v2, path.dirname(require.resolve('../pvm-defaults')))
      nextConfig = this.mergeConfigExtensions(nextConfig, ...nextConfigExtensions)
    }

    // User defined config
    const userConfig: { config: RecursivePartial<Config>, filepath: string | null } = (typeof config === 'string' || !config) ? loadRawConfig(this.configDir) : { config: config ?? {}, filepath: null }
    nextConfigExtensions = this.resolvePlugins(userConfig.config.plugins_v2 ?? [], this.configDir)
    nextConfig = this.mergeConfigExtensions(nextConfig, ...nextConfigExtensions, userConfig.config)

    // Env config
    const envConfig = readEnv() as any
    const envConfigExtensions = this.resolvePlugins(envConfig.plugins_v2 ?? [], this.cwd)
    nextConfig = this.mergeConfigExtensions(nextConfig, ...envConfigExtensions, envConfig)

    migrateDeprecated(nextConfig)

    validateAgainstSchema(nextConfig)

    logger.debug('config.versioning.source is', nextConfig.versioning.source)
    logger.debug('config.versioning.unified_versions_for is', JSON.stringify(nextConfig.versioning.unified_versions_for))

    this.container.register(provide({
      useValue: nextConfig,
      provide: CONFIG_TOKEN,
    }))

    this.registerPlugins(nextConfig)
  }

  /**
   * Used to extend default config when extending Pvm class and want to provide additional
   * defaults for end user
   */
  protected getDefaultConfig(): Config {
    return {
      ...defaultConfig,
      cwd: this.cwd,
      configLookupDir: this.configDir,
    }
  }

  protected mergeConfigExtensions(...configExtensions: RecursivePartial<Config>[]): Config {
    return configExtensions.reduce((acc, extension) => mergeDeep(acc, extension), {} as Config) as Config
  }

  protected resolvePlugins(plugins: PluginConfig[], resolveRoot: string): RecursivePartial<Config>[] {
    let configExtensions: RecursivePartial<Config>[] = []
    for (const pluginConfig of plugins) {
      const { factory, configExt, resolvedPath } = this.resolvePlugin(pluginConfig, resolveRoot)

      // if subsequent config extension overrides plugin config its options will be extended and
      // factory override previous one
      this.pluginFactories.set(pluginConfig.plugin, factory)

      log.info(chalk`plugin {blue ${resolvedPath}} loaded. Resolved from ${resolveRoot}`)

      if (configExt) {
        configExtensions.push(configExt)
        if (configExt.plugins_v2) {
          configExtensions = configExtensions.concat(this.resolvePlugins(configExt.plugins_v2, path.dirname(resolvedPath)))
        }
      }
    }
    return configExtensions
  }

  protected registerPlugins(config: Config): void {
    for (const pluginConfig of config.plugins_v2) {
      const factory = this.pluginFactories.get(pluginConfig.plugin)
      const pluginProviders = factory ? factory(pluginConfig.options || {}).providers : []
      for (const provider of pluginProviders) {
        this.container.register(provider)
      }
    }
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
