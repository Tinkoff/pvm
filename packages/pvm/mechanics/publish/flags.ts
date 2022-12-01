import type { InferredOptionTypes } from 'yargs'
import yargs from 'yargs'

import { enpl } from '../../lib/text/plural'
import { revParse } from '../../lib/git/commands'
import { RELEASE_NOTIFICATIONS_MAP_TOKEN } from '../../tokens'
import type { Container } from '../../lib/di'

const defaultConcurrency = 1

const canaryFlag = {
  canary: {
    type: 'boolean' as const,
    desc: 'Enable canary release mode. In this mode version is calculated in the time of the publication and contains ' +
      'preid suffix from parametes (example: 1.0.1-12ax3f.0). Also in canary mode "strategy" parameter changes it`s default value to "affected"',
    default: false,
  },
  'canary-unified': {
    type: 'boolean' as const,
    desc: 'If true then all packages in canary release will have same version.',
    default: false,
  },
  'canary-base-version': {
    type: 'string' as const,
    desc: 'Base for canary version if unified set to true. For example if base_version = "0.0.0", then canary version will be (by default) "0.0.0-<commit sha>.0"',
    default: '0.0.0',
  },
}

const messageChannelFlag = {
  messageChannel: {
    desc: `Channel for notifications`,
    type: 'string' as const,
  },
}

export const flagsBuilder = (di: Container) => ({
  filter: {
    alias: 'f',
    type: 'array' as const,
    desc: 'Additional filter for returned by strategy packages list. Have a form of list of path glob patterns.',
    default: [] as string[],
  },
  strategy: {
    alias: 's',
    desc: `Which packages should be published. Refer to "pvm pkgset" docs for possible options.`,
    default: function() {
      return yargs.options(canaryFlag).help(false).argv.canary ? 'affected' : 'updated'
    } as unknown as string,
    type: 'string' as const,
  },
  strategyOption: {
    alias: 'S',
    desc: 'Pass option through to the used strategy. Refer to "pvm pkgset" docs for possible options.',
    type: 'array' as const,
    default: [] as string[],
  },
  dryRun: {
    alias: 'n',
    desc: 'Do all the work, except real publishing to registry',
    type: 'boolean' as const,
    default: false,
  },
  tag: {
    alias: 't',
    desc: `Same as --tag option for npm publish command: associates published package with given tag.
    By default equals to latest or canary (if canary mode enabled) unless registry package version is greater than published.`,
    type: 'string' as const,
    default: function() {
      return yargs.options(canaryFlag).help(false).argv.canary ? revParse('HEAD', process.cwd()) : null
    } as unknown as string,
  },
  bail: {
    alias: 'b',
    desc: 'Exit publishing immediately upon the first unsuccessful package publishing.',
    default: false,
    type: 'boolean' as const,
  },
  concurrency: {
    type: 'number' as const,
    alias: 'c',
    desc: `Number of simultaneously executed publishing processes. If argument not specified, makes ${enpl(['%1 threads', '%1 thread', '%1 threads'], defaultConcurrency)}, if argument specified without value, makes a thread to each CPU core`,
  },
  byDependentOrder: {
    default: false,
    type: 'boolean' as const,
    desc: 'Publish packages in concurrency mode according to each other',
  },
  forceVersioning: {
    type: 'string' as const,
    choices: ['tag', 'file', 'package'],
    default: undefined as unknown as (undefined | 'tag' | 'file' | 'package'),
  },
  registry: {
    alias: 'r',
    desc: 'npm registry, default is taken from publishConfig.registry package.json\'s value.',
    type: 'string' as const,
  },
  notify: {
    alias: 'Z',
    desc: 'Send notification if SLACK_WEBHOOK_URL or SLACK_TOKEN env variable present.',
    type: 'boolean' as const,
    default: function() {
      const { canary, messageChannel } = yargs.options({
        ...messageChannelFlag,
        ...canaryFlag,
      }).help(false).argv
      return !canary || !!messageChannel
    } as unknown as boolean,
  },
  notificationName: {
    alias: 'i',
    desc:
      `
      Direct name of notification builder that will be used to build result publish message. Names are
      mapped to values from RELEASE_NOTIFICATIONS_MAP_TOKEN providers. Current builders are:
      ${Object.keys(di.get(RELEASE_NOTIFICATIONS_MAP_TOKEN)!.reduce((acc, m) => Object.assign(acc, m), {})).map(k => ` - ${k}`).join(`\n`)}
    `,
    type: 'string' as const,
  },
  outputStats: {
    alias: 'o',
    desc: `Output filename for JSON report of published packages.`,
    type: 'string' as const,
  },
  ...messageChannelFlag,
  ...canaryFlag,
})

export type Flags = InferredOptionTypes<ReturnType<typeof flagsBuilder>>
