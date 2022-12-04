#!/usr/bin/env node

import pvmChangelogMake from './pvm-changelog-make'
import pvmChangelogDownload from './pvm-changelog-download'
import pvmChangelogUpload from './pvm-changelog-upload'
// eslint-disable-next-line node/no-extraneous-import
import type { Argv } from 'yargs'
import type { Container } from '../../lib/di'
import type { CommandFactory } from '../../types/cli'

export default (di: Container): CommandFactory => builder => builder.command(
  'changelog <command>',
  'Commands for working with Changelog artifacts',
  (builder: Argv) => {
    pvmChangelogMake(di)(builder)
    pvmChangelogDownload(di)(builder)
    pvmChangelogUpload(di)(builder)

    return builder
  }
)
