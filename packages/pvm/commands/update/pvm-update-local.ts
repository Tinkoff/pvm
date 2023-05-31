// eslint-disable-next-line node/no-extraneous-import
import type { Container } from '../../lib/di'

import pvmUpdate from './pvm-update'
import { GLOBAL_FLAGS_TOKEN } from '../../tokens'
import type { CommandFactory } from '../../types/cli'

export default (di: Container): CommandFactory => (yargs) => yargs.command(
  'local <update>',
  'Enables local mode for the following command',
  (yargs) => {
    const nextYargs = yargs
      .example(`$0 local update`, `Update packages locally and don't create the commit in a remote repository`)
      .middleware((argv) => {
        const globalFlags = di.get(GLOBAL_FLAGS_TOKEN)
        globalFlags.setFlag('localMode', true)
        return argv
      })
      .demandCommand()

    return pvmUpdate(di)(nextYargs)
  },
  () => {}
)
