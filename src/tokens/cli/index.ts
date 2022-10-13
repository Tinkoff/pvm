import { createToken } from '@pvm/di'
import type { Argv } from 'yargs'

type Command = {
  command: string,
  aliases?: string,
  description: string,
  builder?:(yargs: Argv) => Argv,
  handler:(flags: { [arg: string]: unknown }) => void | Promise<void>,
}
export const CLI_EXTENSION_TOKEN = createToken<Command | Command[]>('CLI_EXTENSION_TOKEN', { multi: true })
export const CLI_TOKEN = createToken<(opts: { argv: string[] }) => void>('CLI_TOKEN')
