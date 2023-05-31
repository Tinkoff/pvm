import chalk from 'chalk'
import pprint from '../mechanics/pkgset/pprint'
import { pkgsetFromFlags } from '../mechanics/pkgset/pkgset'
import { getStrategiesDescriptionList } from '../mechanics/pkgset/strategies'

import type { Container } from '../lib/di'
import type { CommandFactory } from '../types'

export default (di: Container): CommandFactory => builder => builder.command(
  'pkgset',
  'Shows the list of packages by the specified criterion (low-level version)',
  (yargs) => {
    return yargs
      .example('$0 pkgset', 'filter packages in workspaces and print "<name>@<version>" for each package')
      .example('pvm pkgset -f %n -s changed -S from=v1.2.3', 'Print packages names which have been change from v1.2.3 to HEAD')
      .option('strategy', {
        desc: chalk`Filtering strategy. Possible strategies are: ${getStrategiesDescriptionList().join('\n\n  ')}`,
        default: 'all',
        alias: 's',
      })
      .option('strategy-option', {
        alias: 'S',
        desc: 'Pass option through to the used strategy.',
        type: 'array' as const,
        default: [],
      })
      .option('format', {
        desc: `Pretty-print the package information in a given format. Format is string, with special symbols:
  %p - path to package
  %n - package name
  %s - package name without namespace if it's present
  %v - package version
  `,
        default: '%n@%v',
        alias: 'f',
      })
  },
  async function main(flags): Promise<void> {
    for await (const line of pprint(pkgsetFromFlags(di, {
      strategy: flags['strategy'],
      strategyOption: flags['strategy-option'],
    }), flags.format)) {
      console.log(line)
    }
  }
)
