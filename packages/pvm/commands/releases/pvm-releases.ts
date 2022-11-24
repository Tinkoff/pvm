#!/usr/bin/env node

import * as pvmReleasesMake from './pvm-releases-make'
import * as pvmReleasesDownload from './pvm-releases-download'
import * as pvmReleasesUpload from './pvm-releases-upload'
import * as pvmReleasesProbe from './pvm-releases-probe'
// eslint-disable-next-line node/no-extraneous-import
import type { Argv } from 'yargs'

export const command = 'releases <command>'
export const description = 'Commands for working with ReleaseList artifact'
export const builder = (yargs: Argv) => {
  return yargs
    .command(pvmReleasesMake)
    .command(pvmReleasesDownload)
    .command(pvmReleasesUpload)
    .command(pvmReleasesProbe)
}

export const handler = function() {}
