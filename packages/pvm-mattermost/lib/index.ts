import type { Message } from '@pvm/types'
import { AbstractMessengerClient } from '@pvm/notifications'
import { httpreq } from '@pvm/core'
import { checkEnv, env } from '@pvm/core/lib/env'
import { loggerFor } from '@pvm/core/lib/logger'
import { gracefullyTruncateText } from '@pvm/core/lib/utils/string'
import { requestWithRetries } from '@pvm/core/lib/httpreq'

const logger = loggerFor('pvm:mattermost')
const MAX_TEXT_LENGTH = 4000 // ограничение блока текста в mattermost

export class MattermostClient extends AbstractMessengerClient {
  isReady(): boolean {
    const someEnvsSpecified = Boolean(env.PVM_MATTERMOST_INCOMING_WEBHOOK) || checkEnv(['PVM_MATTERMOST_TOKEN', 'PVM_MATTERMOST_URL'], 'mattermost integration', { logger, silent: true })

    if (!someEnvsSpecified) {
      logger.info('Mattermost integration require PVM_MATTERMOST_TOKEN and PVM_MATTERMOST_URL or PVM_MATTERMOST_INCOMING_WEBHOOK environment variables ' +
        'to be specified')
    }

    return someEnvsSpecified
  }

  async getSelfId(): Promise<string | null> {
    try {
      const userInfo = await this.requestApi({
        path: `users/me`,
        method: 'GET',
      })

      return userInfo.json.id
    } catch (e) {
      logger.error('Retrieving self id failed')
      throw e
    }
  }

  async getUserIdFromUserName(userName: string): Promise<string> {
    try {
      const userInfo = await this.requestApi({
        path: `users/username/${userName}`,
        method: 'GET',
      })

      return userInfo.json.id
    } catch (e) {
      logger.error('Retrieving user id from username failed. Maybe it is user id already..')
      throw e
    }
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

      return channelInfo.json.id
    } catch (e) {
      logger.warn('Retrieving channel id from channel name failed. Maybe it is channel id already..')
      return null
    }
  }

  async createDirectChannel(userName: string): Promise<string> {
    const selfId = await this.getSelfId()
    const userId = await this.getUserIdFromUserName(userName)

    try {
      const channelInfo = await this.requestApi({
        path: `channels/direct`,
        method: 'POST',
        body: [
          selfId,
          userId,
        ],
      })

      return channelInfo.json.id
    } catch (e) {
      logger.error(`Creating direct messaging channel for user ${userName} failed`)
      throw e
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
    const userName = message.channel?.startsWith('@') ? message.channel.slice(1) : null
    const channelName = message.channel?.startsWith('#') ? message.channel.slice(1) : message.channel

    if (env.PVM_MATTERMOST_INCOMING_WEBHOOK) {
      await this.requestWithRetries(() => httpreq(env.PVM_MATTERMOST_INCOMING_WEBHOOK!, {
        body: {
          channel: userName ? message.channel : channelName,
          username: message.author?.name,
          icon_url: message.author?.avatarUrl,
          icon_emoji: message.author?.avatarEmoji,
          text: message.content,
          attachments: message.attachments,
        },
        method: 'POST',
      }))
    } else {
      await this.requestApi({
        path: 'posts',
        method: 'POST',
        body: {
          channel_id: userName ? await this.createDirectChannel(userName) : await this.getChannelIdFromChannelName(channelName) ?? channelName,
          message: gracefullyTruncateText(message.content, MAX_TEXT_LENGTH),
          props: {
            attachments: message.attachments,
          },
        },
      })
    }
  }

  async requestApi({ path, method, body }: {
    path: string, method: 'GET' | 'POST', body?: Record<string, any>,
  }): Promise<any> {
    const { PVM_MATTERMOST_TOKEN, PVM_MATTERMOST_URL } = env

    const apiUrl = `${PVM_MATTERMOST_URL!.replace(/\/$/, '')}/api/v4/${path}`

    return this.requestWithRetries(() => httpreq(apiUrl, {
      body,
      method,
      headers: {
        Authorization: `Bearer ${PVM_MATTERMOST_TOKEN}`,
      },
    }))
  }

  async requestWithRetries(requestFn: () => Promise<any>): Promise<any> {
    return requestWithRetries(requestFn, { retryCodes: [408] })
  }
}

export const MessengerClient = MattermostClient
