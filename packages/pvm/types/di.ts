import type { Provider } from '../lib/di'
import type { Config } from '../types'
import type { RecursivePartial } from './utils'

export type PluginOptions = Record<string, any>

export type PluginFactory = (opts: PluginOptions) => { providers: Provider[] }

export type PluginDeclaration = { name: string } & ({
  factory: PluginFactory,
} | {
  configExt: RecursivePartial<Config>,
} | {
  factory: PluginFactory,
  configExt: RecursivePartial<Config>,
})

export type PluginConfig = {
  plugin: string | PluginFactory | PluginDeclaration,
  options?: PluginOptions,
}
