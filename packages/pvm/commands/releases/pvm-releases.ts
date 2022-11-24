#!/usr/bin/env node

import pvmReleasesMake from './pvm-releases-make'
import pvmReleasesDownload from './pvm-releases-download'
import pvmReleasesUpload from './pvm-releases-upload'
import pvmReleasesProbe from './pvm-releases-probe'
// eslint-disable-next-line node/no-extraneous-import
import type { Argv } from 'yargs'
import type { Container } from '../../lib/di'

export default (di: Container) => ({
  command: 'releases <command>',
  description: 'Commands for working with ReleaseList artifact',
  builder: (yargs: Argv) => {
    return yargs
      .command(pvmReleasesMake(di))
      .command(pvmReleasesDownload(di))
      .command(pvmReleasesUpload(di))
      .command(pvmReleasesProbe(di))
  },

  handler: function() {},
})
