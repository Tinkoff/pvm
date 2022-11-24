#!/usr/bin/env node

import * as pvmChangelogMake from './pvm-changelog-make'
import * as pvmChangelogDownload from './pvm-changelog-download'
import * as pvmChangelogUpload from './pvm-changelog-upload'
// eslint-disable-next-line node/no-extraneous-import
import type { Argv } from 'yargs'

export const command = 'changelog <command>'
export const description = 'Commands for working with Changelog artifacts'
export const builder = (yargs: Argv) => {
  return yargs
    .command(pvmChangelogMake)
    .command(pvmChangelogDownload)
    .command(pvmChangelogUpload)
}

export const handler = function() {}
