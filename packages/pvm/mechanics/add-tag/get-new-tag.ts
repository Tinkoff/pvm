import { lastReleaseTag } from '../../lib/git/last-release-tag'
import { log } from '../../lib/logger'
import { wdShell } from '../../lib/shell'
import { getUpdateState } from '../update'
import { createReleaseContext } from '../update/release/release-context'

import type { Config } from '../../types'

export async function getNewTag(config: Config, targetRef = 'HEAD'): Promise<string | null> {
  const lastRelease = lastReleaseTag(config, targetRef)

  const lastRevision = lastRelease ? wdShell(config.cwd, `git rev-list -1 ${lastRelease}`) : null
  const targetRev = wdShell(config.cwd, `git rev-list -1 ${targetRef}`)

  if (lastRelease && lastRevision === targetRev) {
    log(`there is already release ${lastRelease} for ref ${targetRef}, skip generating new tag`)
    return null
  }

  const updateState = await getUpdateState({
    cwd: config.cwd,
    includeRoot: true,
    readonly: true,
  })

  const releaseContext = await createReleaseContext(updateState)
  if (!releaseContext) {
    log(`Unable to create release context, there is no packages for release ?`)
    return null
  }

  log(`new tag will be ${releaseContext.name}`)

  return releaseContext.name
}
