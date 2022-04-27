import yargs from 'yargs'

import { enpl } from '@pvm/core/lib/text/plural'
import { revParse } from '@pvm/core/lib/git/commands'

const defaultConcurrency = 1

const canaryFlag = {
  canary: {
    type: 'boolean' as const,
    desc: 'Enable canary release mode. In this mode version is calculated in the time of the publication and contains ' +
      'preid suffix from parametes (example: 1.0.1-12ax3f.0). Also in canary mode "strategy" parameter changes it`s default value to "affected"',
    default: false,
  },
}

const messageChannelFlag = {
  messageChannel: {
    desc: `Channel for notifications`,
    default: undefined as unknown as string,
  },
}

export const flagsBuilder = {
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
    type: 'string',
    default: function() {
      return yargs.options(canaryFlag).help(false).argv.canary ? revParse('HEAD', process.cwd()) : null
    } as unknown as string,
  },
  bail: {
    alias: 'b',
    desc: 'Exit publishing immediately upon the first unsuccessful package publishing.',
    default: false,
  },
  concurrency: {
    type: 'number' as const,
    alias: 'c',
    desc: `Number of simultaneously executed publishing processes. If argument not specified, makes ${enpl(['%1 threads', '%1 thread', '%1 threads'], defaultConcurrency)}, if argument specified without value, makes a thread to each CPU core`,
    default: undefined as unknown as number,
  },
  byDependentOrder: {
    default: false,
    desc: 'Publish packages in concurrency mode according to each other',
  },
  forceVersioning: {
    type: 'string',
    choices: ['tag', 'file', 'package'],
    default: undefined as unknown as (undefined | 'tag' | 'file' | 'package'),
  },
  registry: {
    alias: 'r',
    desc: 'npm registry, default is taken from publishConfig.registry package.json\'s value.',
    default: undefined as unknown as string,
  },
  notify: {
    alias: 'Z',
    desc: 'Send notification if SLACK_WEBHOOK_URL or SLACK_TOKEN env variable present.',
    type: 'boolean',
    default: function() {
      const { canary, messageChannel } = yargs.options({
        ...messageChannelFlag,
        ...canaryFlag,
      }).help(false).argv
      return !canary || !!messageChannel
    } as unknown as boolean,
  },
  notifyScript: {
    alias: 'i',
    desc:
      `
      The script that will be executed to create the notification text after successfull packages publishing.
      By default, the internal script "@pvm/pvm/notify-scripts/release.js" is used.

      Could be absolute file path, or file path relative to config, or http/https URL to script in the network.

      The script is obliged to send the message through function process.send.
      The message should have the following format: { type: 'message', message: <message payload>. }.

      Also script will receive the object describing the publication in the form:
      {
         tag: 'release-tag',
         commits: <undefined or array of structures described here: https://github.com/bendrucker/git-log-parser#logparseconfig-options---streamcommits>,
         packagesStats: {
           success: [{pkg: string, registryVersion: string, publishedVersion: string}, ...]
           skipped: [{pkg: string, publishVersion: string, reason: string}, ...]
           error: [{pkg: string, publishVersion: string, reason: string}, ...]
        },
      }

      Information about the published status of the packages. For more information about this field, see the documentation site.
    `,
    default: undefined as unknown as string,
  },
  outputStats: {
    alias: 'o',
    desc: `Output filename for JSON report of published packages.`,
    default: undefined as unknown as string,
  },
  ...messageChannelFlag,
  ...canaryFlag,
} as const

type FlagsBuilder = typeof flagsBuilder
export type Flags = {
  [P in keyof FlagsBuilder]: FlagsBuilder[P]['default']
}
