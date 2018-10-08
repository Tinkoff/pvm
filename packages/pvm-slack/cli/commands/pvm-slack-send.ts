import fs from 'fs'
import getStdin from 'get-stdin'

import { getConfig } from '@pvm/core/lib/config'
import type { SlackMessage } from '../../lib'
import { sendMessage } from '../../lib'

// eslint-disable-next-line node/no-extraneous-import
import type { Argv } from 'yargs'

export const command = 'send'
export const description = 'Send message to slack'
export const builder = (yargs: Argv) => {
  return yargs
    .example(
      `$0 slack send -t "hello world"`,
      `Send message to preconfigured slack webhook`
    )
    .example(
      `$0 slack send -m message.json`,
      `Send message to preconfigured slack webhook using passed file as message JSON`
    )
    .option('message', {
      alias: 'm',
      desc: 'message json file. Use "-" for reading from stdin',
    })
    .option('text', {
      alias: 't',
      desc: 'text for sending. Use "-" for reading from stdin. Default: "-" if there is no message nor text passed.',
    })
}
export const handler = send

async function send(flags) {
  const textParam = (!flags.text && !flags.message) ? '-' : flags.text

  let text
  if (textParam) {
    text = textParam === '-' ? await getStdin() : textParam
  }

  let message: SlackMessage = {}

  if (flags.message) {
    const messageStr = flags.message === '-' ? await getStdin() : fs.readFileSync(flags.message).toString('utf8')
    message = JSON.parse(messageStr)
  }
  if (text) {
    message.text = text
  }
  const config = await getConfig()

  return sendMessage(config, message)
}
