const path = require('path')
const runShell = require('../packages/pvm-core/lib/shell/run').default
const execShell = require('../packages/pvm-core/lib/shell/exec').default

const PVM_ENV_CHECK_COMMAND = 'pvm _eval '

const runner = (spawner, repo, cmd, opts = {}) => {
  const localBinPath = path.join(process.cwd(), 'node_modules/.bin')

  const newEnv = {
    ...process.env,
    PVM_TESTING_ENV: 'true',
    ...opts.env,
    ...repo.env,
    PATH: [process.env.PATH, localBinPath].join(path.delimiter),
    Path: [process.env.Path, localBinPath].join(path.delimiter),
    NODE_PATH: path.resolve(__dirname, '../packages'),
  }

  // Исполняем команду всё, что передано после PVM_ENV_CHECK_COMMAND, чтобы проверить окружение, в котором будут
  // исполняться команды pvm
  if (cmd.startsWith(PVM_ENV_CHECK_COMMAND)) {
    cmd = cmd.replace(PVM_ENV_CHECK_COMMAND, '')
  }

  return spawner(cmd, {
    cwd: repo.dir,
    ...opts,
    env: newEnv,
  })
}

const runScript = (repo, cmd, opts) => {
  return runner(runShell, repo, cmd, opts)
}

const execScript = (repo, cmd, opts = {}) => {
  const execOpts = Object.assign({
    printStderr: true,
  }, opts)
  return runner(execShell, repo, cmd, execOpts)
}

exports.runScript = runScript
exports.execScript = execScript
