import { createToken } from '../lib/di'
import type { CommandFactory } from '../types'

export const CLI_EXTENSION_TOKEN = createToken<CommandFactory | CommandFactory[]>('CLI_EXTENSION_TOKEN', { multi: true })
export const CLI_TOKEN = createToken<(opts: { argv: string[] }) => void>('CLI_TOKEN')
