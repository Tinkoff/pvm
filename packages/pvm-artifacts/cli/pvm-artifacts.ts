#!/usr/bin/env node

import * as pvmArtifactsDownload from './pvm-artifacts-download'
import * as pvmArtifactsUpload from './pvm-artifacts-upload'

// eslint-disable-next-line node/no-extraneous-import
import type { Argv } from 'yargs'

export const command = 'artifacts <command>'
export const description = 'Commands for working with pvm artifacts'
export const builder = (yargs: Argv) => {
  return yargs
    .command(pvmArtifactsDownload)
    .command(pvmArtifactsUpload)
}

export const handler = function() {}
