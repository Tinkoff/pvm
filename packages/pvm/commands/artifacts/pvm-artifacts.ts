#!/usr/bin/env node

import pvmArtifactsDownload from './pvm-artifacts-download'
import pvmArtifactsUpload from './pvm-artifacts-upload'

// eslint-disable-next-line node/no-extraneous-import
import type { Argv } from 'yargs'
import type { Container } from '../../lib/di'

export default (di: Container) => ({
  command: 'artifacts <command>',
  description: 'Commands for working with pvm artifacts',
  builder: (yargs: Argv) => {
    return yargs
      .command(pvmArtifactsDownload(di))
      .command(pvmArtifactsUpload(di))
  },
  handler: function() {},
})
