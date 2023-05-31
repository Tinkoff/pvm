import pvmReleasesMake from './pvm-releases-make'
import pvmReleasesDownload from './pvm-releases-download'
import pvmReleasesUpload from './pvm-releases-upload'
import pvmReleasesProbe from './pvm-releases-probe'
import type { Container } from '../../lib/di'
import type { CommandFactory } from '../../types'

export default (di: Container): CommandFactory => builder => builder.command(
  'releases <command>',
  'Commands for working with ReleaseList artifact',
  (yargs) => {
    pvmReleasesMake(di)(yargs)
    pvmReleasesDownload(di)(yargs)
    pvmReleasesUpload(di)(yargs)
    pvmReleasesProbe(di)(yargs)

    return yargs
  }
)
