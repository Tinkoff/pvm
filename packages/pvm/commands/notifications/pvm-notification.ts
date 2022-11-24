// eslint-disable-next-line node/no-extraneous-import
import type { Argv } from 'yargs'

export const command = 'notification <command>'
export const description = 'Send messages to messenger(s)'
export const builder = (yargs: Argv) => {
  return yargs
    .commandDir('commands')
    .demandCommand()
    .help('--help')
}
export const handler = () => {}
