import fs from 'fs'
import getStdin from 'get-stdin'

import type { Container } from '../../lib/di'
import type { CommandFactory, Message } from '../../types'
import { NOTIFICATOR_TOKEN } from '../../tokens'

export default (di: Container): CommandFactory => builder => builder.command(
  'send',
  'Send message to configured messengers',
  (yargs) => {
    return yargs
      .example(
        `$0 notification send -m message.json`,
        `Send message to messengers according to pvm configuration`
      )
      .option('target', {
        alias: 't',
        type: 'array',
        desc: 'target messenger or list of them. Possible values are: all, first-available and concrete messenger name',
      })
      .option('file', {
        alias: 'f',
        desc: 'message json file. Available fields described in doc https://tinkoff.github.io/pvm/docs/api/modules/pvm_pvm#message',
        type: 'string',
      })
      .option('channel', {
        alias: 'c',
        desc: 'channel where to send message',
        type: 'string',
      })
      .option('message', {
        alias: 'm',
        desc: 'text for sending. Use "-" for reading from stdin. Default: "-" if there is no message nor text passed.',
        type: 'string',
      })
  },
  async function send(flags): Promise<void> {
    const contentParam = (!flags.file && !flags.message) ? '-' : flags.message

    let content
    if (contentParam) {
      content = contentParam === '-' ? await getStdin() : contentParam
    }

    let messageBuild: { channel?: string, content?: string } = {}
    if (flags.file) {
      const messageStr = fs.readFileSync(flags.file).toString('utf8')
      messageBuild = JSON.parse(messageStr)
    }

    if (flags.channel) {
      messageBuild.channel = flags.channel
    }

    if (content) {
      messageBuild.content = content
    }

    const message: Message = messageBuild as Message

    const messenger = di.get(NOTIFICATOR_TOKEN)

    const target = flags.target?.map(String)
    return messenger.sendMessage(message, {
      target: target ? target.length === 1 ? target[0] : target : undefined,
    })
  }
)
