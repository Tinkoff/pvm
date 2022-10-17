#!/usr/bin/env node
import * as TOML from '@iarna/toml'

import { wdShell } from '@pvm/core/lib/shell'
import { getConfig } from '@pvm/core/lib/config'
import { error } from '@pvm/core/lib/logger'
import { lastReleaseTag } from '@pvm/core/lib/git/last-release-tag'
import { releaseCommitsAsString } from '@pvm/core/lib/git/release-commits'
import sinceLastRelease from '@pvm/update/lib/strategies/since-last-release'
import { Repository } from '@pvm/repository'

import type { Argv } from 'yargs'

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

function asyncPrint(fn) {
  return (...args) => {
    return Promise.resolve(fn(...args))
      .then(result => {
        pprint(result)
      })
      .catch(e => {
        process.exitCode = 1
        error(e)
      })
  }
}

async function resolveLastReleaseTag(): Promise<string> {
  const config = await getConfig()
  return lastReleaseTag(config)
}

async function printChangelog(flags) {
  const config = await getConfig()
  const release = flags.release || 'HEAD'
  let targetRef = release
  const latestReleaseTag = lastReleaseTag(config, release)
  const cwd = config.cwd

  if (wdShell(cwd, `git rev-list -1 ${latestReleaseTag}`) === wdShell(cwd, `git rev-list -1 ${release}`)) {
    targetRef = `${release}^`
  }

  const repo = new Repository(cwd, config)
  const hostApi = await repo.getHostApi()

  const changedContext = await sinceLastRelease(targetRef, {
    cwd,
  })

  return hostApi.commitsToNotes(changedContext.commits)
}

async function releaseCommitsCommand(args): Promise<string | void> {
  const config = await getConfig()
  return releaseCommitsAsString(config, {
    target: args.release || 'HEAD',
    format: args.format,
  })
}

async function showConfig(): Promise<string> {
  const config = await getConfig(process.cwd())
  return TOML.stringify(config as { [key: string]: any })
}

export const command = 'show <command>'
export const description = 'show various information for repository'
export const builder = (yargs: Argv) => {
  return yargs
    .command(['last-release-tag', 'lrt'], `show name of latest release tag`, {}, asyncPrint(resolveLastReleaseTag))
    .command('changelog', 'show changelog for last/given release', {}, asyncPrint(printChangelog))
    .command(['release-commits', 'rc'], 'show commit titles for last/given release', {
      release: {
        desc: 'Specify ref of release for release-commits command. Defaults to HEAD',
      },
      format: {
        desc: 'Specify pretty print format for release-commits command',
        default: '%s',
      },
    }, asyncPrint(releaseCommitsCommand))
    .command('config', 'show current config', {}, asyncPrint(showConfig))
}

export const handler = function() {}
