import path from 'path'
import runShell from '../packages/pvm/lib/shell/run'
import execShell from '../packages/pvm/lib/shell/exec'
import type { RepoTestApi } from './types'
import type { ExecShellOptions, RunShellOptions } from '@pvm/pvm'

const PVM_ENV_CHECK_COMMAND = 'pvm _eval '

function runner(spawner: typeof runShell, repo: RepoTestApi, cmd: string, opts: RunShellOptions): ReturnType<typeof runShell>
function runner(spawner: typeof execShell, repo: RepoTestApi, cmd: string, opts: ExecShellOptions): ReturnType<typeof execShell>
function runner(spawner: typeof execShell | typeof runShell, repo: RepoTestApi, cmd: string, opts: RunShellOptions | ExecShellOptions): ReturnType<typeof execShell | typeof runShell> {
  const localBinPath = path.join(process.cwd(), 'node_modules/.bin')

  const newEnv: Record<string, string> = {
    ...process.env,
    PVM_TESTING_ENV: 'true',
    ...opts.env,
    ...repo.env,
    PATH: [process.env.PATH, localBinPath].join(path.delimiter),
    Path: [process.env.Path, localBinPath].join(path.delimiter),
    NODE_PATH: path.resolve(__dirname, '../packages'),
  }

  newEnv.NODE_OPTIONS = `${newEnv.NODE_OPTIONS ? `${newEnv.NODE_OPTIONS} ` : ''}--enable-source-maps`

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

export const runScript = (repo: RepoTestApi, cmd: string, opts: RunShellOptions = {}): ReturnType<typeof runShell> => {
  return runner(runShell, repo, cmd, opts)
}

export const execScript = (repo: RepoTestApi, cmd: string, opts: ExecShellOptions = {}): ReturnType<typeof execShell> => {
  const execOpts = Object.assign({
    printStderr: true,
  }, opts)
  return runner(execShell, repo, cmd, execOpts)
}
