#!/usr/bin/env node

import shell from '../shell'

const lastTag = (opts = void 0): string => {
  try {
    return shell(`git describe --tags --abbrev=0 --first-parent`, opts)
  } catch (ex) {
    return ''
  }
}

if (require.main === module) {
  console.log(lastTag())
}

export default lastTag
