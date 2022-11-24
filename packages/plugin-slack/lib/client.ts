import type { Message } from '@pvm/pvm'
import { AbstractMessengerClient, checkEnv, loggerFor, gracefullyTruncateText } from '@pvm/pvm'
import { sendMessage } from './api'

import slackifyMarkdown from 'slackify-markdown'
import omitBy from 'lodash.omitby'

const logger = loggerFor('pvm:slack')

const MAX_TEXT_LENGTH = 3000 // ограничение блока текста в слаке

export class SlackClient extends AbstractMessengerClient {
  isReady(): boolean {
    return checkEnv([{ oneOf: ['SLACK_TOKEN', 'PVM_SLACK_TOKEN'] }, { oneOf: ['SLACK_API_URL', 'PVM_SLACK_API_URL'] }], 'slack integration', { logger, silent: true })
  }

  protected async internalSendMessage(message: Message): Promise<void> {
    await sendMessage(omitBy({
      username: message.author?.name,
      icon_emoji: message.author?.avatarEmoji,
      icon_url: message.author?.avatarUrl,
      blocks: [{
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: slackifyMarkdown(gracefullyTruncateText(message.content, MAX_TEXT_LENGTH)).trim(),
        },
      }],
      attachments: message.attachments?.map(attachment => {
        const slackified = {}

        for (const field of Object.keys(attachment)) {
          if (typeof attachment[field] !== 'string') {
            slackified[field] = attachment[field]
          } else {
            slackified[field] = slackifyMarkdown(attachment[field]).trim()
          }
        }

        return slackified
      }),
      channel: message.channel,
    }, prop => prop === undefined))
  }
}
