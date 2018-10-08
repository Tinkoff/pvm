#!/usr/bin/env node

import { log } from '@pvm/core/lib/logger'
import initVcs from '@pvm/vcs'
import { getConfig } from '@pvm/core/lib/config'
import getPreviousRefForFirstRelease from '@pvm/core/lib/behaviors/previous-ref-for-initial-release'
import { makeReleaseForTag } from '@pvm/core/lib/release-notes'
import type { PlatformReleaseTag } from '@pvm/vcs/types/index'

export const command = 'rewrite-notes'
export const description = 'Recalculate and rewrite release notes for particular range of git tags'
export const builder = {
  'skip-first': {
    desc: 'Do not overwrite release notes for first release tag',
    default: false,
  },
  'only-for': {
    desc: 'Overwrite release notes only for defined tag',
  },
  'stop-at': {
    desc: 'Stop rewriting release notes on defined tag',
  },
  'dry-run': {
    desc: '`Generate notes but not persist changes to vcs',
  },
}

export const handler = pvmRewriteNotes

async function pvmRewriteNotes(flags) {
  const vcs = await initVcs({ dryRun: flags.dryRun })
  let nextReleaseTag: PlatformReleaseTag | null = null

  // идем от самого свежего к первому
  for await (const releaseTag of vcs.releaseTagsIterator()) {
    if (nextReleaseTag && (!flags.onlyFor || flags.onlyFor === nextReleaseTag.name)) {
      if (flags.stopAt === nextReleaseTag.name) {
        log(`You asked me stop at ${flags.stopAt}. Stopping now`)
        break
      }
      await makeReleaseForTag(vcs, nextReleaseTag, releaseTag.name)
      if (flags.onlyFor === nextReleaseTag.name) {
        break
      }
    }

    nextReleaseTag = releaseTag
  }

  if (!flags.skipFirst && nextReleaseTag &&
    (!flags.onlyFor || flags.onlyFor === nextReleaseTag.name) && flags.stopAt !== nextReleaseTag.name) {
    const config = await getConfig()
    await makeReleaseForTag(
      vcs,
      nextReleaseTag,
      getPreviousRefForFirstRelease(config, nextReleaseTag.name)
    )
  }
}
