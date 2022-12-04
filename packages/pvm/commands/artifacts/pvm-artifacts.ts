import pvmArtifactsDownload from './pvm-artifacts-download'
import pvmArtifactsUpload from './pvm-artifacts-upload'

import type { Container } from '../../lib/di'
import type { CommandFactory } from '../../types/cli'

export default (di: Container): CommandFactory => yargs => yargs.command(
  'artifacts <command>',
  'Commands for working with pvm artifacts',
  (yargs) => {
    pvmArtifactsDownload(di)(yargs)
    pvmArtifactsUpload(di)(yargs)

    return yargs
  },
  function() {}
)
