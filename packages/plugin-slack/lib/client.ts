import type { Message } from '@pvm/pvm'
import { AbstractMessengerClient, checkEnv, loggerFor, gracefullyTruncateText } from '@pvm/pvm'
import { sendMessage } from './api'

import slackifyMarkdown from 'slackify-markdown'
import { typedObjectKeys } from '@pvm/pvm/lib/utils'

const logger = loggerFor('pvm:slack')

const MAX_TEXT_LENGTH = 3000 // ограничение блока текста в слаке

export class SlackClient extends AbstractMessengerClient {
  isReady(): boolean {
    return checkEnv([{ oneOf: ['SLACK_TOKEN', 'PVM_SLACK_TOKEN'] }, { oneOf: ['SLACK_API_URL', 'PVM_SLACK_API_URL'] }], 'slack integration', { logger, silent: true })
  }

  protected async internalSendMessage(message: Message): Promise<void> {
    const slackMessage: Record<string, any> = {
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
      attachments: message.attachments?.map((attachment) => {
        const slackified: { [p in keyof typeof attachment]: any } = {}
        const attachmentFields = typedObjectKeys(attachment)

        for (const field of attachmentFields) {
          const fieldValue = attachment[field]
          if (typeof fieldValue !== 'string') {
            slackified[field] = attachment[field]
          } else {
            slackified[field] = slackifyMarkdown(fieldValue).trim()
          }
        }

        return slackified
      }),
      channel: message.channel,
    }

    for (const [k, v] of Object.entries(slackMessage)) {
      if (v === undefined) {
        delete slackMessage[k]
      }
    }

    await sendMessage(slackMessage)
  }
}
