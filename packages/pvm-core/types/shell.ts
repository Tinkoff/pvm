import type { SpawnOptions } from 'child_process'

export interface ExecShellOptions extends SpawnOptions {
  input?: string | Buffer,
  printStderr?: boolean,
  printStdout?: boolean,
}

export interface RunShellOptions extends SpawnOptions {
  input?: string | Buffer,
  printStderr?: boolean,
}
