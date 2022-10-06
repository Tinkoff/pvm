import { spawn } from 'child_process'
import type { ExecShellOptions } from '@pvm/types'

interface ShellError extends Error {
  code: number | null,
  stdout: string,
  stderr: string,
}

interface ExecResult {
  stdout: string,
  stderr: string,
}

const execShell = (cmd: string, opts: ExecShellOptions = {}): Promise<ExecResult> => {
  return new Promise((resolve, reject) => {
    const { input, printStderr = false, printStdout = false, ...rest } = opts
    let args: string[] = []
    let runCmd = cmd
    let shell = true
    if (process.platform !== 'win32') {
      shell = false
      runCmd = '/usr/bin/env'
      args = ['bash', '-euo', 'pipefail', '-c', cmd]
    }
    const child = spawn(runCmd, args, {
      ...rest,
      stdio: 'pipe',
      shell,
    })
    let stdout = ''
    let stderr = ''

    child.on('error', e => {
      reject(e)
    })
    child.on('close', (code) => {
      if (code !== 0) {
        const err: ShellError = new Error(`Command "${cmd}" exited with ${code} status\n${stderr}`) as ShellError
        err.code = code
        err.stdout = stdout
        err.stderr = stderr
        reject(err)
      } else {
        resolve({
          stdout,
          stderr,
        })
      }
    })

    child.stdout.on('data', data => {
      stdout += data.toString()
      if (printStdout) {
        process.stdout.write(data)
      }
    })

    child.stderr.on('data', data => {
      stderr += data.toString()
      if (printStderr) {
        process.stderr.write(data)
      }
    })

    if (input) {
      child.stdin.end(input)
    }
  })
}

export default execShell
