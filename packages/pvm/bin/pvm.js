#!/usr/bin/env node

require('../lib/required-bin-versions.js').verifyRequiredBins()
  .then(() => {
    require('../cli/pvm')
  })
  .catch(e => {
    console.error(e)
    process.exitCode = 1
  })
