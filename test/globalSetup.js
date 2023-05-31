const { start } = require('./gl-api-mock')
const fs = require('fs')
const path = require('path')
const shell = require('../packages/pvm/lib/shell').cwdShell
const { reposDir } = require('./repos-dir')

async function setup() {
  const app = await start()
  process.env.PVM_CONFIG_GITLAB__URL = `http://localhost:${app.httpServer.address().port}`

  if (!fs.existsSync(reposDir)) {
    fs.mkdirSync(reposDir)
  } else {
    shell(`rm -rf ${reposDir}/*`)
  }
  if (reposDir !== 'test/__repos' && fs.existsSync('test/__repos') && fs.readlinkSync('test/__repos') !== reposDir) {
    fs.unlinkSync('test/__repos')
  }

  if (reposDir !== 'test/__repos' && !fs.existsSync('test/__repos')) {
    fs.symlinkSync(
      reposDir,
      path.resolve(__dirname, '..', 'test/__repos'),
      'dir'
    )
  }
}

module.exports = setup
