#!/usr/bin/env node
import chalk from 'chalk'
import { getStrategiesDescriptionList } from '../mechanics/pkgset/strategies'
import { parseSubArgs } from '../lib/text/sub-args'
import getFiles from '../mechanics/files/files'

// eslint-disable-next-line node/no-extraneous-import
import type Yargs from 'yargs'

export const command = 'files'
export const description = 'Output files by glob in the list of packages (packages are choosing by pkgset strategies logic)'
export const builder = (yargs: Yargs.Argv) => {
  return yargs
    .example('$0 files -f *.stories.js', 'filter files in all packages')
    .example('$0 files -f *.js -s changed -S from=v1.2.3', 'Return .js files in packages which have been changed from v1.2.3 to HEAD')
    .option('files', {
      alias: 'f',
      desc: chalk`Glob pattern or array of patterns for result files. Returned files would be filtered by packages collected by passed strategy.`,
      demandOption: true,
    })
    .option('strategy', {
      alias: 's',
      desc: chalk`Filtering strategy. Possible strategies are: ${getStrategiesDescriptionList().join('\n\n  ')}`,
      default: 'all',
    })
    .option('absolute', {
      desc: 'Return absolute paths to file',
      default: true,
      type: 'boolean' as const,
    })
    .option('S', {
      alias: 'strategy-option',
      desc: 'Pass option through to the used strategy.',
      type: 'array' as const,
      default: [],
      coerce: parseSubArgs,
    })
}

export const handler = main

async function main(argv): Promise<void> {
  (await getFiles(argv.files, { ...argv, ...argv.strategyOption }))
    .forEach(f => console.log(f))
}
