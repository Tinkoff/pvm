// eslint-disable-next-line node/no-extraneous-import
import type { Argv } from 'yargs'
import type { Container } from '../../lib/di'
import pvmNotificationSend from './pvm-notification-send'

export default (di: Container) => ({
  command: 'notification <command>',
  description: 'Send messages to messenger(s)',
  builder: (yargs: Argv) => {
    return yargs
      .command(pvmNotificationSend(di))
  },
  handler: () => {},
})
