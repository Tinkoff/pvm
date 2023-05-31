import chalk from 'chalk'
import { getStrategiesDescriptionList } from '../mechanics/pkgset/strategies'
import { parseSubArgs } from '../lib/text/sub-args'
import getFiles from '../mechanics/files/files'

import type { Container } from '../lib/di'
import type { CommandFactory } from '../types/cli'

export default (di: Container): CommandFactory => builder => builder.command(
  'files',
  'Output files by glob in the list of packages (packages are choosing by pkgset strategies logic)',
  (yargs) => {
    return yargs
      .example('$0 files -f *.stories.js', 'filter files in all packages')
      .example('$0 files -f *.js -s changed -S from=v1.2.3', 'Return .js files in packages which have been changed from v1.2.3 to HEAD')
      .option('files', {
        alias: 'f',
        desc: chalk`Glob pattern or array of patterns for result files. Returned files would be filtered by packages collected by passed strategy.`,
        demandOption: true,
        type: 'array',
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
      .option('strategy-option', {
        alias: 'S',
        desc: 'Pass option through to the used strategy.',
        type: 'array' as const,
        default: [],
        coerce: parseSubArgs,
      })
  },
  async function main(argv): Promise<void> {
    (await getFiles(di, argv.files.map(String), { ...argv, ...argv['strategy-option'] }))
      .forEach(f => console.log(f))
  }
)
