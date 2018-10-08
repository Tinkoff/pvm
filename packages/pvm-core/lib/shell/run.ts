// как shell, только не захватываем вывод рисуя все как есть
import { spawn } from 'child_process'
import type { StdioOptions } from 'child_process'

import type { RunShellOptions } from '../../types/shell'
import WritableStream = NodeJS.WritableStream
import { env } from '../env'

type ArrayStdioOptions<T = StdioOptions> = T extends Array<any> ? T : never

function stdioAsArray(stdio: StdioOptions): ArrayStdioOptions {
  if (typeof stdio === 'string') {
    return [stdio, stdio, stdio]
  }
  return stdio
}

export interface RunShellError extends Error {
  stderr: string,
}

function stdioSmartHandler(stdio: StdioOptions) {
  stdio = stdioAsArray(stdio)
  const streamNames = ['stdin', 'stdout', 'stderr']
  const replacedStreams: Record<string, WritableStream> = {}
  stdio = stdio.map((maybeStream, i) => {
    // keep stdin as is
    if (i === 0) {
      return maybeStream
    }
    if (typeof maybeStream === 'object' && maybeStream !== null && typeof maybeStream['write'] === 'function' && !('fd' in maybeStream)) {
      replacedStreams[streamNames[i]] = maybeStream as unknown as WritableStream
      return 'pipe'
    }
    return maybeStream
  })
  const handler = (child) => {
    for (const [name, stream] of Object.entries(replacedStreams)) {
      child[name].on('data', data => {
        stream.write(data)
      })
    }
  }
  return {
    stdio,
    handler,
  }
}

const outputAllRunShellCommands = !!env.PVM_OUTPUT_ALL_RUN_SHELL_COMMANDS

const runShell = (cmd: string, opts: RunShellOptions = {}): Promise<void> => {
  return new Promise((resolve, reject) => {
    const { input, stdio: inputStdio, printStderr = !inputStdio, ...rest } = opts
    const { stdio, handler } = stdioSmartHandler(inputStdio || ['pipe', 1, 'pipe'])

    if (outputAllRunShellCommands) {
      console.error(cmd)
    }

    let args: string[] = []
    let runCmd = cmd
    let shell = true
    if (process.platform !== 'win32') {
      shell = false
      runCmd = '/usr/bin/env'
      args = ['bash', '-euo', 'pipefail', '-c', cmd]
    }

    const child = spawn(runCmd, args, {
      stdio,
      ...rest,
      shell,
    })
    handler(child)

    child.on('error', e => {
      reject(e)
    })

    let stderr = ''

    if (child.stderr) {
      child.stderr.on('data', data => {
        stderr += data.toString('utf8')
        if (printStderr) {
          process.stderr.write(data)
        }
      })
    }

    child.on('close', (code) => {
      if (code !== 0) {
        let message = `Command "${cmd}" exited with ${code} status`
        if (!printStderr) {
          message += `:\n${stderr}`
        }
        const error = new Error(message)
        ;(error as RunShellError).stderr = stderr
        reject(error)
      } else {
        resolve()
      }
    })

    if (input) {
      child.stdin!.end(input)
    }
  })
}

export default runShell
