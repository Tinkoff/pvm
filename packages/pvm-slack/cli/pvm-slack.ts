// eslint-disable-next-line node/no-extraneous-import
import type { Argv } from 'yargs'

export const command = 'slack <command>'
export const description = 'Send messages to slack'
export const builder = (yargs: Argv) => {
  return yargs
    .commandDir('commands')
    .demandCommand()
}
export const handler = () => {}
