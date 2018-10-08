const { Signales } = require('signales')
const chalk = require('chalk')
const commandExistsSync = require('command-exists').sync

const pkg = require('./package.json')
const log = new Signales({
  scope: 'required-commands',
})

const checkPassed = pkg.requiredCommands.every(cmd => {
  if (!commandExistsSync(cmd)) {
    log.fatal(chalk`Required shell command {blue ${cmd}} is not found in PATH`)
    return false
  }

  return true
})

if (checkPassed) {
  log.success('All required commands presented')
}

process.exitCode = checkPassed ? 0 : 1
