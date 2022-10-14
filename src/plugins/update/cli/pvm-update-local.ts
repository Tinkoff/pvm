// eslint-disable-next-line node/no-extraneous-import
import type { Argv } from 'yargs'

import * as pvmUpdate from './pvm-update'

export const command = 'local <update>'
export const description = 'Enables local mode for the following command'
export const builder = (yargs: Argv) => {
  return yargs
    .example(`$0 local update`, `Update packages locally and don't create the commit in a remote repository`)
    .middleware(argv => {
      argv.local = true
      return argv
    })
    .command(pvmUpdate)
    .demandCommand()
}
export const handler = () => {}
