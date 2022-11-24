// eslint-disable-next-line node/no-extraneous-import
import type { Argv } from 'yargs'
import type { Container } from '../../lib/di'

import pvmUpdate from './pvm-update'

export default (di: Container) => ({
  command: 'local <update>',
  description: 'Enables local mode for the following command',
  builder: (yargs: Argv) => {
    return yargs
      .example(`$0 local update`, `Update packages locally and don't create the commit in a remote repository`)
      .middleware(argv => {
        argv.local = true
        return argv
      })
      .command(pvmUpdate(di))
      .demandCommand()
  },
  handler: () => {},
})
