import type { Message } from '@pvm/types'
import { AbstractMessengerClient } from '@pvm/notifications'
import { httpreq } from '@pvm/core'
import { checkEnv, env } from '@pvm/core/lib/env'
import { loggerFor } from '@pvm/core/lib/logger'
import { gracefullyTruncateText } from '@pvm/core/lib/utils/string'

const logger = loggerFor('pvm:mattermost')
const MAX_TEXT_LENGTH = 4000 // ограничение блока текста в mattermost

export class MattermostClient extends AbstractMessengerClient {
  isReady(): boolean {
    return checkEnv(['PVM_MATTERMOST_TOKEN', 'PVM_MATTERMOST_URL'], 'mattermost integration', { logger, silent: true })
  }

  async getChannelIdFromChannelName(channelName: string): Promise<string | null> {
    const { PVM_MATTERMOST_TEAM } = env

    try {
      const resultTeam = PVM_MATTERMOST_TEAM ?? this.clientConfig.team
      if (!resultTeam) {
        logger.warn('PVM_MATTERMOST_TEAM env variable or team value from config are not provided. Assume "channel" value is channel_id.')
        return null
      }

      const channelInfo = await this.requestApi({
        path: `teams/name/${resultTeam}/channels/name/${channelName}`,
        method: 'GET',
      })

      return channelInfo.id
    } catch (e) {
      logger.warn('Retrieving channel id from channel name failed. Maybe it is channel id already..')
      return null
    }
  }

  /**
   * Internal method for sending messages. Message here already populated with all sorts of defaults.
   *
   * Channel and content here are mandatory. This is checked in {@link AbstractMessengerClient.sendMessage}
   * @param message
   * @protected
   */
  protected async internalSendMessage(message: Message & { channel: string, content: string }): Promise<void> {
    await this.requestApi({
      path: 'posts',
      method: 'POST',
      body: {
        channel_id: await this.getChannelIdFromChannelName(message.channel) ?? message.channel,
        message: gracefullyTruncateText(message.content, MAX_TEXT_LENGTH),
        props: {
          attachments: message.attachments,
        },
      },
    })
  }

  async requestApi({ path, method, body }: {
    path: string, method: 'GET' | 'POST', body?: Record<string, any>,
  }): Promise<any> {
    const { PVM_MATTERMOST_TOKEN, PVM_MATTERMOST_URL } = env

    const apiUrl = `${PVM_MATTERMOST_URL!.replace(/\/$/, '')}/api/v4/${path}`

    return httpreq(apiUrl, {
      body,
      method,
      headers: {
        Authorization: `Bearer ${PVM_MATTERMOST_TOKEN}`,
      },
    })
  }
}

export const MessengerClient = MattermostClient
