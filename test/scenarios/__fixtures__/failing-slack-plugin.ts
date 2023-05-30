import type { MessengerClientConfig } from '@pvm/pvm'
import { declarePlugin, Notificator, provide, AbstractMessengerClient } from '@pvm/pvm'
import { CONFIG_TOKEN, CWD_TOKEN, MESSENGER_CLIENT_TOKEN } from '@pvm/pvm/tokens'

export default declarePlugin({
  factory: (opts: MessengerClientConfig & { name?: string }) => ({
    providers: [
      provide({
        provide: MESSENGER_CLIENT_TOKEN,
        useFactory: ({ config }) => Notificator.createClient(// @ts-ignore
          class FailingClient extends AbstractMessengerClient {
            isReady() { return true }
            // @ts-ignore
            internalSendMessage() {
              throw new Error('Send failed')
            }
          }, config, {
            name: 'slack',
            ...opts,
          }),
        deps: {
          config: CONFIG_TOKEN,
          cwd: CWD_TOKEN,
        },
      }),
    ],
  }),
})
