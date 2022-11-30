import type { Argv, Options } from 'yargs'
import { createToken } from '../lib/di'

type Command = {
  command: string,
  aliases?: string,
  description: string,
  builder?: ((yargs: Argv) => Argv) | { [key: string]: Options },
  handler:(flags: { [arg: string]: unknown }) => any | Promise<any>,
}
export const CLI_EXTENSION_TOKEN = createToken<Command | Command[]>('CLI_EXTENSION_TOKEN', { multi: true })
export const CLI_TOKEN = createToken<(opts: { argv: string[] }) => void>('CLI_TOKEN')
