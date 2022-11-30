import type { MessengerClientConfig } from '@pvm/pvm'
import { declarePlugin, Notificator, provide } from '@pvm/pvm'
import { CONFIG_TOKEN, CWD_TOKEN, MESSENGER_CLIENT_TOKEN } from '@pvm/pvm/tokens'
import { SlackClient } from './client'

export * from './api'
export * from './messaging'

export default declarePlugin({
  factory: (opts: MessengerClientConfig & { name?: string }) => ({
    providers: [
      provide({
        provide: MESSENGER_CLIENT_TOKEN,
        useFactory: ({ config }) => Notificator.createClient(SlackClient, config, opts),
        deps: {
          config: CONFIG_TOKEN,
          cwd: CWD_TOKEN,
        },
      }),
    ],
  }),
})
