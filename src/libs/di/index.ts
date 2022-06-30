import type { Config, PluginFactory } from '@pvm/types'

export * from '@tinkoff/dippy'

export function declarePlugin({ configExt, factory }: { configExt?: Partial<Config>, factory?: PluginFactory}) {
  return {
    configExt,
    factory,
  }
}
