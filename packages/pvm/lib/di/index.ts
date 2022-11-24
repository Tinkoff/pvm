import type { Config, PluginFactory, RecursivePartial } from '../../types'

export * from '@tinkoff/dippy'

export function declarePlugin(opts: { configExt: RecursivePartial<Config>, factory: PluginFactory} | { factory: PluginFactory} | { configExt: RecursivePartial<Config>}) {
  return {
    name: __filename,
    ...opts,
  }
}
