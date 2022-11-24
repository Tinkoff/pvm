#!/usr/bin/env node

import pvmChangelogMake from './pvm-changelog-make'
import pvmChangelogDownload from './pvm-changelog-download'
import pvmChangelogUpload from './pvm-changelog-upload'
// eslint-disable-next-line node/no-extraneous-import
import type { Argv } from 'yargs'
import type { Container } from '../../lib/di'

export default (di: Container) => ({
  command: 'changelog <command>',
  description: 'Commands for working with Changelog artifacts',
  builder: (yargs: Argv) => {
    return yargs
      .command(pvmChangelogMake(di))
      .command(pvmChangelogDownload(di))
      .command(pvmChangelogUpload(di))
  },

  handler: function() {},
})
