import { MessengerClients } from './messenger-clients'
import type { AbstractMessengerClient } from './abstract-messenger-client'
import type { Message, MessengerClientConfig } from '@pvm/types'
import type { Config } from '@pvm/core/lib/config'
import { getConfig } from '@pvm/core/lib/config'
import { logger } from './logger'
import resolveFrom from 'resolve-from'
import { requireDefault } from '@pvm/core'
import defaultsDeep from 'lodash.defaultsdeep'
import { getHostApi } from '@pvm/core/lib/plugins'

export class Notificator {
  private messengers: MessengerClients
  private config: Config

  constructor(config: Config) {
    this.config = config
    this.messengers = new MessengerClients()
    this.config.notifications.clients.forEach(({ name, pkg }) => {
      const Client = require(pkg).MessengerClient as { new(name: string, config: Config, clientConfig?: MessengerClientConfig): AbstractMessengerClient }
      if (!Client) {
        throw new Error(`Messenger client ${pkg} should have named export "MessengerClient"`)
      }

      this.messengers.register(name, new Client(name, config, Notificator.getClientConfig(name, config)))
    })
  }

  static getClientConfig(clientName: string, config: Config): MessengerClientConfig {
    const projectPkg = resolveFrom.silent(config.cwd, './package')
    const username = projectPkg ? `${requireDefault(projectPkg).name} minion` : void 0
    return defaultsDeep({}, config.notifications.client_configs[clientName], config.notifications.clients_common_config, {
      author: {
        name: username,
      },
    })
  }

  static async create(cwd: string = process.cwd()): Promise<Notificator> {
    // initializing plugins
    await getHostApi(cwd)
    return new Notificator(await getConfig(cwd))
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
