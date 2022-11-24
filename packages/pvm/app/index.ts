import path from 'path'
import type { PluginConfig, PluginFactory, Config, RecursivePartial, PluginDeclaration } from '../types'
import { Container, DI_TOKEN, provide } from '../lib/di'
import { CLI_EXTENSION_TOKEN, CLI_TOKEN, CONFIG_TOKEN, CWD_TOKEN } from '../tokens'
import {
  defaultsFromProvider,
  loadRawConfig,
  mergeDefaults,
  migrateDeprecated,
  readEnv,
  validateAgainstSchema,
} from '../lib/config/get-config'
import { defaultConfig } from '../pvm-defaults'
import { logger, loggerFor } from '../lib/logger'
import { verifyRequiredBins } from './required-bin-versions'
import chalk from 'chalk'
import { resolvePvmProvider } from '../lib/plugins/provider'
import { runCli } from '../lib/cli/cli-runner'
import { getNewTag } from '../mechanics/add-tag/get-new-tag'
import { loadPkg } from '../lib/pkg'
import getFiles from '../mechanics/files/files'
import { Notificator } from '../mechanics/notifications'
import { pkgset } from '../mechanics/pkgset/pkgset'
import { getPackages } from '../mechanics/packages'
import { getCurrentRelease } from '../mechanics/releases'
import { Repository } from '../mechanics/repository'
import { getUpdateState } from '../mechanics/update'
import { download, upload } from '../mechanics/artifacts/pub/artifacts'

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

    this.container.register(provide({
      provide: CLI_TOKEN,
      useFactory({ cliExtensions }) {
        return ({ argv }: { argv: string[] }) => runCli(cliExtensions ?? [], argv)
      },
      deps: {
        cliExtensions: { token: CLI_EXTENSION_TOKEN, optional: true, multi: true } as const,
      },
    }))

    this.initConfigAndPlugins(config, plugins)
  }

  /**
   * Runs cli. Used to start pvm as cli app.
   */
  public runCli(argv: string[] = process.argv): void {
    verifyRequiredBins().then(() => {
      this.container.get(CLI_TOKEN)({
        argv,
      })
    }).catch(e => {
      console.error(e)
      process.exitCode = 1
    })
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
    return new Notificator(this.container.get(CONFIG_TOKEN))
  }

  public getPkgSet(strategy: string, opts: Record<string, any>): ReturnType<typeof pkgset> {
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
    return new Repository(
      this.container,
      ref
    )
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

  protected initConfigAndPlugins(config: RecursivePartial<Config> | string | null | undefined, plugins: PluginConfig[] = []) {
    const configExtensions:RecursivePartial<Config>[] = []
    // Env config
    configExtensions.push(readEnv())

    // User defined config
    const userConfig: { config: RecursivePartial<Config>, filepath: string | null } = (typeof config === 'string' || !config) ? loadRawConfig(this.configDir) : { config: config ?? {}, filepath: null }
    configExtensions.push(this.setupConfigDirs(userConfig.config, this.cwd, this.configDir))
    let nextConfig = this.mergeConfigExtensions(configExtensions)

    // Config extensions from plugins
    let nextConfigExtensions = this.registerPlugins(plugins ?? [], this.configDir)
    nextConfig = mergeDefaults(nextConfig, this.mergeConfigExtensions(nextConfigExtensions))

    // Config extensions from user defined plugins
    nextConfigExtensions = this.registerPlugins(nextConfig.plugins_v2 ?? [], this.configDir)
    nextConfig = mergeDefaults(nextConfig, this.mergeConfigExtensions(nextConfigExtensions))

    const provider = resolvePvmProvider(userConfig.filepath ? path.dirname(path.resolve(this.configDir, userConfig.filepath)) : this.configDir)
    if (provider) {
      const providerConfig = defaultsFromProvider(provider)
      if (providerConfig) {
        // Config extensions from provider itself
        nextConfig = mergeDefaults(nextConfig, providerConfig)
        if (providerConfig.plugins_v2) {
          nextConfigExtensions = this.registerPlugins(providerConfig.plugins_v2, provider.path)
          // Config extensions from provider plugins
          nextConfig = mergeDefaults(nextConfig, this.mergeConfigExtensions(nextConfigExtensions))
        }
      }
    }

    if (defaultConfig.plugins_v2) {
      nextConfigExtensions = this.registerPlugins(defaultConfig.plugins_v2, path.dirname(require.resolve('../pvm-defaults')))
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
      log.info(chalk`plugin {blue ${resolvedPath}} loaded. Resolved from ${resolveRoot}`)

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

  private setupConfigDirs(resultConfig: RecursivePartial<Config>, cwd: string, configLookupDir: string) {
    resultConfig.cwd = cwd
    resultConfig.configLookupDir = configLookupDir

    return resultConfig
  }
}
