import type { Config, PluginFactory } from '@pvm/types'

export * from '@tinkoff/dippy'

export function declarePlugin(opts: { configExt: Partial<Config>, factory: PluginFactory} | { factory: PluginFactory} | { configExt: Partial<Config>}) {
  if ('configExt' in opts && 'factory' in opts) {
    return opts
  }

  if ('configExt' in opts) {
    return {
      configExt: opts.configExt,
    }
  }

  return {
    factory: opts.factory,
  }
}
