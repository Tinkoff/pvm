import type { Config, PluginFactory, RecursivePartial } from '../../types'

export * from '@tinkoff/dippy'

export function declarePlugin(opts: { factory: PluginFactory }): { name: string, factory?: PluginFactory}
export function declarePlugin(opts: { configExt: RecursivePartial<Config> }): { name: string, configExt?: RecursivePartial<Config> }
export function declarePlugin(opts: { configExt: RecursivePartial<Config>, factory: PluginFactory} | { factory: PluginFactory} | { configExt: RecursivePartial<Config>}): { name: string, configExt?: RecursivePartial<Config>, factory?: PluginFactory} {
  return {
    name: __filename,
    ...opts,
  }
}
