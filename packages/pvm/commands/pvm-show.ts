#!/usr/bin/env node
import * as TOML from '@iarna/toml'

import { wdShell } from '../lib/shell'
import { logger } from '../lib/logger'
import { lastReleaseTag } from '../lib/git/last-release-tag'
import { releaseCommitsAsString } from '../lib/git/release-commits'
import sinceLastRelease from '../mechanics/update/strategies/since-last-release'
import { Repository } from '../mechanics/repository'

import type { Argv } from 'yargs'
import type { Container } from '@tinkoff/dippy'
import { CONFIG_TOKEN } from '../tokens'

function pprint(val): void {
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

function asyncPrint(di, fn) {
  return (...args) => {
    return Promise.resolve(fn(di, ...args))
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

async function printChangelog(di: Container, flags) {
  const config = di.get(CONFIG_TOKEN)
  const release = flags.release || 'HEAD'
  let targetRef = release
  const latestReleaseTag = lastReleaseTag(config, release)
  const cwd = config.cwd

  if (wdShell(cwd, `git rev-list -1 ${latestReleaseTag}`) === wdShell(cwd, `git rev-list -1 ${release}`)) {
    targetRef = `${release}^`
  }

  const repo = new Repository(di)
  const hostApi = await repo.getHostApi()

  const changedContext = await sinceLastRelease(di, targetRef, {
    cwd,
  })

  return hostApi.commitsToNotes(changedContext.commits)
}

async function releaseCommitsCommand(di: Container, args): Promise<string | void> {
  const config = di.get(CONFIG_TOKEN)
  return releaseCommitsAsString(config, {
    target: args.release || 'HEAD',
    format: args.format,
  })
}

async function showConfig(di: Container): Promise<string> {
  const config = di.get(CONFIG_TOKEN)
  return TOML.stringify(config as { [key: string]: any })
}

export default (di: Container) => ({
  command: 'show <command>',
  description: 'show various information for repository',
  builder: (yargs: Argv) => {
    return yargs
      .command(['last-release-tag', 'lrt'], `show name of latest release tag`, {}, asyncPrint(di, resolveLastReleaseTag))
      .command('changelog', 'show changelog for last/given release', {}, asyncPrint(di, printChangelog))
      .command(['release-commits', 'rc'], 'show commit titles for last/given release', {
        release: {
          desc: 'Specify ref of release for release-commits command. Defaults to HEAD',
        },
        format: {
          desc: 'Specify pretty print format for release-commits command',
          default: '%s',
        },
      }, asyncPrint(di, releaseCommitsCommand))
      .command('config', 'show current config', {}, asyncPrint(di, showConfig))
  },

  handler: function() {},
})
