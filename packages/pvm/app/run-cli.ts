import { verifyRequiredBins } from './required-bin-versions'
import { CLI_TOKEN } from '../tokens'
import type { Pvm } from './index'
import yargs from 'yargs'

export function runCli(PvmClass: typeof Pvm, argv: string[] = process.argv) {
  const cfgFromCli = yargs(argv).argv.config as string | undefined
  const pvm = new PvmClass({
    config: cfgFromCli ?? process.cwd(),
  })
  verifyRequiredBins().then(() => {
    pvm.container.get(CLI_TOKEN)({
      argv,
    })
  }).catch(e => {
    console.error(e)
    process.exitCode = 1
  })
}
