#!/usr/bin/env node

import { setVersions } from '../mechanics/set-versions'
import type { Container } from '../lib/di'

export default (di: Container) => ({
  command: 'set-versions <versionOrReleaseType>',
  description: 'Set given version for given packages',
  builder: (yargs) => {
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

  handler: async function main(argv): Promise<void> {
    return setVersions(di, argv)
  },
})
