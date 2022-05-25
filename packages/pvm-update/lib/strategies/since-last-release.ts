import fs from 'fs'
import path from 'path'

import { loggerFor } from '@pvm/core/lib/logger'
import { getConfig } from '@pvm/core/lib/config'
import __dangerous_shell, { wdShell } from '@pvm/core/lib/shell'
import { lastReleaseTag } from '@pvm/core/lib/git/last-release-tag'
import { changedFiles } from '@pvm/pkgset/lib/changed-files'
import { getOldestDescendantCommitRef, gitFetch } from '@pvm/core/lib/git/commands'

import { ChangedContext } from '../changed-context'

import type { IncludeRootOption } from '@pvm/pkgset/types'
import type { Config } from '@pvm/core/lib/config'
import initVcsPlatform from '@pvm/vcs'

const logger = loggerFor('pvm:changed-files')
const GIT_DEEPEN_VALUE = 50

export interface SinceLastReleaseOpts {
  includeRoot?: IncludeRootOption,
  noReleaseRef?: string,
  includeUncommited?: boolean,
  cwd?: string,
}

function prettyFormatRef(config: Config, ref: string): string {
  return `${ref} (${__dangerous_shell(`git log --format=%s -n 1 ${ref}`, { cwd: config.cwd })})`
}

// Try to check that we dont have commit trees that are disconnected with start commit probably because of not
// enough `--depth` value in git clone/fetch commands. So if merge-base failed then try `git fetch --unshallow` to load full
// commits tree. After that no check performed because if merge-base is failed again then it means that there are
// really two different trees were merged.
function ensureCommitsDepth(cwd: string, from: string, to: string): void {
  const isShallowCloned = fs.existsSync(path.join(cwd, '.git/shallow'))
  if (!isShallowCloned) {
    return
  }

  // look for the oldest commit in log
  const firstLogCommit = wdShell(cwd, `git log --reverse --format=%H ${from}..${to}`).split('\n')[0]
  if (firstLogCommit) {
    try {
      wdShell(cwd, `git merge-base ${from} ${firstLogCommit}`)
    } catch (e) {
      logger.info(`do deepen (${GIT_DEEPEN_VALUE}) git fetch ...`)
      gitFetch(cwd, {
        deepen: GIT_DEEPEN_VALUE,
      })
      // when all commits are fetched .git/shallow is removed and recursion stops
      ensureCommitsDepth(cwd, from, to)
    }
  }
}

// вычисляет последний релиз, и на основе него получаем коммиты и список пакетов на новый релиз
async function sinceLastRelease(targetRef: string, opts: SinceLastReleaseOpts): Promise<ChangedContext> {
  const config = await getConfig(opts.cwd)
  const vcsPlatform = await initVcsPlatform({
    cwd: opts.cwd,
  })
  const updConfig = config.update

  const {
    includeRoot = updConfig.include_root,
    noReleaseRef: noReleaseRefOpt = updConfig.no_release_ref,
    includeUncommited = updConfig.include_uncommited,
    cwd = process.cwd(), // @TODO: задепрекейтить
  } = opts

  const gitShell = (cmd: string) => __dangerous_shell(cmd, { cwd })

  const noReleaseRef = noReleaseRefOpt || getOldestDescendantCommitRef(config.cwd, vcsPlatform.getCurrentBranch(), targetRef)

  const lastRelease = lastReleaseTag(config, targetRef)

  if (!lastRelease) {
    logger.info(`there are no releases, compare from ${noReleaseRef}`)
  }

  const fromRef = lastRelease || noReleaseRef
  const lastRevision = gitShell(`git rev-list -1 ${fromRef}`)
  const targetRevision = gitShell(`git rev-list -1 ${targetRef}`)

  if (lastRevision === targetRevision) {
    logger.info(`there is no commits for ${prettyFormatRef(config, targetRef)} from base ref`)
  }

  logger.info('analyze commits from', prettyFormatRef(config, lastRevision), 'to', prettyFormatRef(config, targetRef))

  if (includeUncommited) {
    logger.info('also taking into account uncommited changes')
  }

  ensureCommitsDepth(cwd, fromRef, targetRef)

  const affectedFiles = changedFiles({
    from: fromRef,
    to: targetRef,
    includeUncommited,
    cwd,
  })

  return await ChangedContext.make(affectedFiles, {
    config,
    includeRoot,
  })
}

export default sinceLastRelease
