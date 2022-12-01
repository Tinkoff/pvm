// eslint-disable-next-line node/no-extraneous-import
import type { Argv } from 'yargs'
import type { Container } from '../../lib/di'

import pvmUpdate from './pvm-update'
import { GLOBAL_FLAGS_TOKEN } from '../../tokens'

export default (di: Container) => ({
  command: 'local <update>',
  description: 'Enables local mode for the following command',
  builder: (yargs: Argv) => {
    return yargs
      .example(`$0 local update`, `Update packages locally and don't create the commit in a remote repository`)
      .middleware((argv) => {
        const globalFlags = di.get(GLOBAL_FLAGS_TOKEN)
        globalFlags.setFlag('localMode', true)
        return argv
      })
      .command(pvmUpdate(di))
      .demandCommand()
  },
  handler: () => {},
})
