import { MessengerClients } from './messenger-clients'
import type { AbstractMessengerClient } from './abstract-messenger-client'
import type { Message, MessengerClientConfig, Config } from '../../types'

import { logger } from './logger'
import resolveFrom from 'resolve-from'
import { requireDefault } from '../../lib/interop'
import defaultsDeep from 'lodash.defaultsdeep'
import type { Container } from '../../lib/di'
import { CONFIG_TOKEN, MESSENGER_CLIENT_TOKEN } from '../../tokens'

export class Notificator {
  private messengers: MessengerClients
  private config: Config

  constructor(di: Container) {
    this.config = di.get(CONFIG_TOKEN)
    this.messengers = new MessengerClients()

    const clients = di.get(MESSENGER_CLIENT_TOKEN)
    clients.forEach(client => {
      this.messengers.register(client.name, client)
    })
  }

  static createClient(Client: { new(name: string, config: Config, clientConfig?: MessengerClientConfig): AbstractMessengerClient }, config: Config, opts: MessengerClientConfig & { name?: string }): AbstractMessengerClient {
    const projectPkg = resolveFrom.silent(config.cwd, './package')
    const username = projectPkg ? `${requireDefault(projectPkg).name} minion` : void 0
    return new Client(opts.name ?? Client.name, config, defaultsDeep({}, opts, config.notifications.clients_common_config, {
      author: {
        name: username,
      },
    }))
  }

  async sendMessage(message: Message, opts: { target?: string } = {}): Promise<void> {
    const target = opts.target ?? this.config.notifications.target
    const errors: Error[] = []
    switch (target) {
      case 'all':
        await Promise.all(this.messengers.getAll().map(messenger => messenger.isReady() ? messenger.sendMessage(message).catch(e => {
          errors.push(e)
        }) : Promise.resolve()))
        break
      case 'first_available': {
        const firstAvailable = this.messengers.getFirstAvailable()
        if (firstAvailable) {
          await firstAvailable.sendMessage(message)
        }
        break
      }
      default:
        if (target) {
          const targets = Array.isArray(target) ? target : [target]
          await Promise.all(targets.map(messengerName => {
            const messenger = this.messengers.get(messengerName)
            if (messenger) {
              if (messenger.isReady()) {
                return messenger.sendMessage(message).catch(e => {
                  errors.push(e)
                })
              }
            } else {
              logger.warn(`No messenger with name "${messengerName}" found`)
            }
            return Promise.resolve()
          }).filter(Boolean))
        }
    }
    if (errors.length) {
      throw new Error(`Message sent is finished with errors:\n${errors.map(e => `${e.message}\n${e.stack}`).join('\n')}`)
    }
  }
}
