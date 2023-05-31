import type { Argv } from 'yargs'

export type CommandFactory = (yargs: Argv) => Argv
