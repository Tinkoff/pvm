import type { ExecSyncOptions, SpawnSyncReturns } from 'child_process'
import { spawnSync } from 'child_process'
import { logger } from '../logger'

let lastLoggedCommand

export class ShellError extends Error {
  stderr: string | Buffer = ''
  stdout: string | Buffer = ''
  status: number | null = null
  signal: NodeJS.Signals | null = null
  pid = -Infinity

  static assignShellResult(target: ShellError, result: SpawnSyncReturns<Buffer | string>): ShellError {
    target.stdout = result.stdout
    target.stderr = result.stderr
    target.status = result.status
    target.signal = result.signal
    target.pid = result.pid
    return target
  }

  assignShellResult(result: SpawnSyncReturns<Buffer | string>) {
    ShellError.assignShellResult(this, result)
  }
}

// @deprecated import cwdShell or wdShell instead
export function shell(cmd: string, opts: ExecSyncOptions = {}): string {
  // by default there is no need to pipe stderr to parent process
  const patchedOpts: ExecSyncOptions = Object.assign({
    stdio: 'pipe',
  }, opts)

  let args: string[] = []
  let runCmd = cmd
  let shell = true
  if (process.platform !== 'win32') {
    shell = false
    runCmd = '/usr/bin/env'
    args = ['bash', '-euo', 'pipefail', '-c', cmd]
  }

  // eslint-disable-next-line pvm/no-process-env
  if (process.platform === 'win32' && (!process.env.COMSPEC || process.env.COMSPEC.endsWith('system32\\cmd.exe'))) {
    // escape \^ because it is an escape character in windows cmd.exe
    runCmd = cmd.replace(/\^/g, '^^')
  }

  if (lastLoggedCommand !== cmd) {
    logger.silly(`run ${cmd}`, 'cwd=', opts.cwd)
    lastLoggedCommand = cmd
  }

  const result = spawnSync(runCmd, args, {
    ...patchedOpts,
    shell,
  })

  if (result.error) {
    const e = result.error as ShellError
    ShellError.assignShellResult(e, result)
    throw e
  }
  if (result.status !== 0) {
    const e = new ShellError(`${result.stderr || ''}\nCommand "${cmd}" exited with ${result.status} status code`)
    e.assignShellResult(result)
    throw e
  }

  if (result.stdout) {
    return result.stdout.toString('utf-8').trim()
  }
  return ''
}

export function cwdShell(cmd: string, opts: ExecSyncOptions = {}): string {
  return shell(cmd, opts)
}

export function wdShell(wd: string, cmd: string, opts: ExecSyncOptions = {}): string {
  return shell(cmd, {
    ...opts,
    cwd: wd,
  })
}

// eslint-disable-next-line
export function bindToCwd<O extends object, F extends (cmd: string, opts?: O) => any>(cwd: string, fn: F): (cmd: string, opts?: O) => ReturnType<F> {
  return (cmd: string, opts?: O): ReturnType<F> => {
    // @ts-ignore
    return fn(cmd, {
      ...opts,
      cwd,
    })
  }
}

export function shellOr(def: string, cmd: string, opts: ExecSyncOptions = {}): string {
  try {
    return shell(cmd, opts)
  } catch (ex) {
    return def
  }
}

// @deprecated import cwdShell or wdShell instead
export default shell
