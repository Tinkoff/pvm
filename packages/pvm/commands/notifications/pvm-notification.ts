// eslint-disable-next-line node/no-extraneous-import
import type { Argv } from 'yargs'
import type { Container } from '../../lib/di'
import pvmNotificationSend from './pvm-notification-send'
import type { CommandFactory } from '../../types/cli'

export default (di: Container): CommandFactory => builder => builder.command(
  'notification <command>',
  'Send messages to messenger(s)',
  (yargs: Argv) => {
    return pvmNotificationSend(di)(yargs)
  }
)
