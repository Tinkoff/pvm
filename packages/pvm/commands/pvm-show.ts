#!/usr/bin/env node
import * as TOML from '@iarna/toml'

import { wdShell } from '../lib/shell'
import { logger } from '../lib/logger'
import { lastReleaseTag } from '../lib/git/last-release-tag'
import { releaseCommitsAsString } from '../lib/git/release-commits'
import sinceLastRelease from '../mechanics/update/strategies/since-last-release'

import type { Argv } from 'yargs'
import type { Container } from '../lib/di'
import { CONFIG_TOKEN, HOST_API_TOKEN } from '../tokens'
import type { CommandFactory } from '../types'

function pprint(val: any): void {
  if (val === void 0) {
    return
  }
  let pval = val
  if (Array.isArray(pval)) {
    pval = val.join('\n')
  } else if (typeof val === 'object' && val) {
    pval = JSON.stringify(val)
  }
  console.log(pval)
}

function asyncPrint<F>(di: Container, fn: (di: Container, flags: F) => Promise<any>) {
  return (flags: F) => {
    return Promise.resolve(fn(di, flags))
      .then(result => {
        pprint(result)
      })
      .catch(e => {
        process.exitCode = 1
        logger.error(e)
      })
  }
}

async function resolveLastReleaseTag(di: Container): Promise<string> {
  const config = di.get(CONFIG_TOKEN)
  return lastReleaseTag(config)
}

async function printChangelog<F extends { release: string }>(di: Container, flags: F) {
  const config = di.get(CONFIG_TOKEN)
  const release = flags.release
  let targetRef = release
  const latestReleaseTag = lastReleaseTag(config, release)
  const cwd = config.cwd

  if (wdShell(cwd, `git rev-list -1 ${latestReleaseTag}`) === wdShell(cwd, `git rev-list -1 ${release}`)) {
    targetRef = `${release}^`
  }

  const hostApi = di.get(HOST_API_TOKEN)

  const changedContext = await sinceLastRelease(di, targetRef, {
    cwd,
  })

  return hostApi.commitsToNotes(changedContext.commits)
}

async function releaseCommitsCommand<F extends { release: string, format?: string }>(di: Container, args: F): Promise<string | void> {
  const config = di.get(CONFIG_TOKEN)
  return releaseCommitsAsString(config, {
    target: args.release,
    format: args.format,
  })
}

async function showConfig(di: Container): Promise<string> {
  const config = di.get(CONFIG_TOKEN)
  return TOML.stringify(config as { [key: string]: any })
}

export default (di: Container): CommandFactory => builder => builder.command(
  'show <command>',
  'show various information for repository',
  (yargs: Argv) => {
    return yargs
      .command(['last-release-tag', 'lrt'], `show name of latest release tag`, {}, asyncPrint(di, resolveLastReleaseTag))
      .command('changelog', 'show changelog for last/given release', {
        release: {
          desc: 'Specify ref of release for release-commits command',
          default: 'HEAD',
          type: 'string',
        },
      }, asyncPrint(di, printChangelog))
      .command(['release-commits', 'rc'], 'show commit titles for last/given release', {
        release: {
          desc: 'Specify ref of release for release-commits command. Defaults to HEAD',
          default: 'HEAD',
          type: 'string',
        },
        format: {
          desc: 'Specify pretty print format for release-commits command',
          default: '%s',
          type: 'string',
        },
      }, asyncPrint(di, releaseCommitsCommand))
      .command('config', 'show current config', {}, asyncPrint(di, showConfig))
  },

  function() {}
)
