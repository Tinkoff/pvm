import type { Config, BasePlatformInterface } from '@pvm/types'

import { createToken } from '@pvm/di'
import type { Argv, Options } from 'yargs'

export const CONFIG_TOKEN = createToken<Config>('CONFIG')
export const CWD_TOKEN = createToken<string>('CWD_TOKEN')
export const REPO_TOKEN = createToken<string>('REPO_TOKEN')
/**
 * @deprecated use new plugin system and DI instead
 */
export const HOST_API = createToken<any>('HOST_API')

export const PLATFORM_TOKEN = createToken<BasePlatformInterface<any>>('PLATFORM_TOKEN')

type Command = {
  command: string,
  aliases?: string,
  description: string,
  builder?: ((yargs: Argv) => Argv) | { [key: string]: Options },
  handler:(flags: { [arg: string]: unknown }) => any | Promise<any>,
}
export const CLI_EXTENSION_TOKEN = createToken<Command | Command[]>('CLI_EXTENSION_TOKEN', { multi: true })
export const CLI_TOKEN = createToken<(opts: { argv: string[] }) => void>('CLI_TOKEN')
