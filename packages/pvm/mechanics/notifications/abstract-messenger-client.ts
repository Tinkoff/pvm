import type { Config, Message, MessengerClientConfig } from '../../types'

import { logger } from './logger'
import defaultsDeep from 'lodash.defaultsdeep'

export abstract class AbstractMessengerClient {
  // eslint-disable-next-line no-useless-constructor
  constructor(public name: string, protected config: Config, protected clientConfig: MessengerClientConfig = {}) {
  }

  getMessageWithDefaults(message: Message): Message {
    const clientConfig = this.clientConfig

    return defaultsDeep({}, message, {
      channel: clientConfig.channel,
      author: clientConfig.author,
    })
  }

  abstract isReady(): boolean

  async sendMessage(message: Message): Promise<void> {
    const withDefaults = this.getMessageWithDefaults(message)

    if (withDefaults.content === undefined) {
      logger.error('"content" should be defined via configuration or passed argument')
    }

    return this.internalSendMessage(withDefaults)
      .catch(e => {
        e.message = `[messenger "${this.name}"]${e.statusCode ? ` responseCode = ${e.statusCode} ` : ' '}${!e.message || e.message === 'null' ? 'No error message specified' : e.message}`
        throw e
      })
  }

  protected abstract internalSendMessage(message: Message): Promise<void>
}
