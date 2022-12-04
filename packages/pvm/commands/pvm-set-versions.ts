#!/usr/bin/env node

import { setVersions } from '../mechanics/set-versions'
import type { Container } from '../lib/di'
import type { CommandFactory } from '../types'

export default (di: Container): CommandFactory => builder => builder.command(
  'set-versions <versionOrReleaseType>',
  'Set given version for given packages',
  (yargs) => {
    return yargs
      .example('$0 set-versions minor -p src/components/*', 'Bump version for given packages')
      .example('$0 set-versions 0.0.1 -u', 'Set version 0.0.1 for all packages and also update dependencies')
      .options({
        strategy: {
          alias: 's',
          desc: 'Which packages we should peek up in the first place. See pvm-pkgset --help for details.',
          default: 'all',
        },
        'update-dependants': {
          alias: 'u',
          desc: 'Update dependencies for dependants as well',
          default: false,
        },
        'bump-dependants': {
          alias: 'b',
          desc: 'Update versions for dependants',
          default: false,
        },
        'strategy-option': {
          alias: 'X',
          desc: 'Options for used strategy',
          type: 'array' as const,
        },
        'filter-path': {
          alias: 'p',
          desc: `Filter packages by path. Globbing is supported. You can pass this option multiple times. Example: -p "src/co-*"`,
          type: 'array' as const,
        },
      })
  },

  async function main(argv): Promise<void> {
    return setVersions(di, {
      bumpDependants: argv['bump-dependants'],
      filterPath: argv['filter-path']?.map(String),
      strategy: argv.strategy,
      strategyOption: argv['strategy-option']?.map(String),
      updateDependants: argv['update-dependants'],
      versionOrReleaseType: argv.versionOrReleaseType as string,
    })
  }
)
