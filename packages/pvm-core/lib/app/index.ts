import path from 'path'
import type { PluginConfig, PluginFactory, Config, RecursivePartial, PluginDeclaration } from '@pvm/types'
import { Container, DI_TOKEN, provide } from '@pvm/di'
import { CONFIG_TOKEN, CWD_TOKEN } from '@pvm/tokens-common'
import { loadRawConfig, postprocessConfig, readEnv } from '../config/get-config'
import { loggerFor } from '../logger'
import chalk from 'chalk'

const log = loggerFor('pvm:app')

export function isPlainObject(x: unknown): x is Record<string, unknown> {
  return !!x && !Array.isArray(x) && typeof x === 'object'
}

export class Pvm {
  container: Container
  cwd: string
  configDir: string
  configExtensions: RecursivePartial<Config>[] = []
  api: any

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

  protected initConfigAndPlugins(config: RecursivePartial<Config> | string | null, plugins: PluginConfig[] = [], cwd: string) {
    this.configExtensions.push(readEnv())
    this.configExtensions.push(this.setupConfigDirs(typeof config === 'string' ? loadRawConfig(config).config : config ?? {}, this.cwd, this.configDir))

    const initialConfig = this.mergeConfigExtensions()
    if (initialConfig.plugins_v2) {
      this.registerPlugins(initialConfig.plugins_v2, cwd)
    }
    this.registerPlugins(plugins, cwd)

    this.container.register(provide({
      useValue: this.fulfillConfig(),
      provide: CONFIG_TOKEN,
    }))
  }

  protected static mergeConfigs<T extends Record<string, any>>(a: T, b: Record<string, any>): T {
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
      } else if (isPlainObject(a[key]) && isPlainObject(b[key])) {
        result[key] = Pvm.mergeConfigs(a[key], b[key])
      }
    })

    return result as T
  }

  protected mergeConfigExtensions(): Config {
    return this.configExtensions.reduce((acc, extension) => {
      acc = Pvm.mergeConfigs(acc, extension)
      acc.plugins_v2 = (acc.plugins_v2 ?? []).concat(extension.plugins_v2 ?? [])
      return acc
    }, {} as Config) as Config
  }

  private setupConfigDirs(resultConfig: RecursivePartial<Config>, cwd: string, configLookupDir: string) {
    resultConfig.cwd = cwd
    resultConfig.configLookupDir = configLookupDir

    return resultConfig
  }

  protected fulfillConfig(): Config {
    const config = this.mergeConfigExtensions()
    return postprocessConfig(config as Config)
  }

  protected registerPlugins(plugins: PluginConfig[], resolveRoot: string): void {
    for (const pluginConfig of plugins) {
      const { factory, configExt, resolvedPath } = this.resolvePlugin(pluginConfig, resolveRoot)
      const pluginProviders = factory ? factory(pluginConfig.options || {}).providers : []
      for (const provider of pluginProviders) {
        this.container.register(provider)
      }
      log.info(chalk`plugin {blue ${resolvedPath}} loaded`)

      if (configExt) {
        this.configExtensions.push(configExt)
        if (configExt.plugins_v2) {
          this.registerPlugins(configExt.plugins_v2, path.dirname(resolvedPath))
        }
      }
    }
  }

  protected resolvePlugin(pluginConfig: PluginConfig, resolveRoot: string): { factory?: PluginFactory, configExt?: RecursivePartial<Config>, resolvedPath: string } {
    if (typeof pluginConfig.plugin === 'string') {
      const pluginPath = require.resolve(pluginConfig.plugin, { paths: [resolveRoot] })
      return { ...(require(pluginPath).default as PluginDeclaration), resolvedPath: pluginPath }
    }

    const opts = isPlainObject(pluginConfig.plugin) ? pluginConfig.plugin : { factory: pluginConfig.plugin }

    return { ...opts, resolvedPath: resolveRoot }
  }

  protected initNodeApi() {

  }
}
