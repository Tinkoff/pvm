import { provide } from '../../lib/di'
import { CONFIG_TOKEN, MESSENGER_CLIENT_TOKEN, NOTIFICATOR_TOKEN } from '../../tokens'
import { Notificator } from './notificator'

export default [
  provide({
    provide: NOTIFICATOR_TOKEN,
    useClass: Notificator,
    deps: {
      config: CONFIG_TOKEN,
      messengerClients: {
        token: MESSENGER_CLIENT_TOKEN,
        optional: true,
      },
    },
  }),
]
