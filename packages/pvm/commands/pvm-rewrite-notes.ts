#!/usr/bin/env node

import { log } from '../lib/logger'
import getPreviousRefForFirstRelease from '../lib/git/previous-ref-for-initial-release'
import type { PlatformReleaseTag } from '../types'
import type { Container } from '../lib/di'
import { CONFIG_TOKEN, PLATFORM_TOKEN } from '../tokens'

export default (di: Container) => ({
  command: 'rewrite-notes',
  description: 'Recalculate and rewrite release notes for particular range of git tags',
  builder: {
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
  },

  handler: async function pvmRewriteNotes(flags) {
    const platform = di.get(PLATFORM_TOKEN)
    let nextReleaseTag: PlatformReleaseTag | null = null

    // идем от самого свежего к первому
    for await (const releaseTag of platform.releaseTagsIterator()) {
      if (nextReleaseTag && (!flags.onlyFor || flags.onlyFor === nextReleaseTag.name)) {
        if (flags.stopAt === nextReleaseTag.name) {
          log(`You asked me stop at ${flags.stopAt}. Stopping now`)
          break
        }
        await platform.makeReleaseForTag(nextReleaseTag, releaseTag.name)
        if (flags.onlyFor === nextReleaseTag.name) {
          break
        }
      }

      nextReleaseTag = releaseTag
    }

    if (!flags.skipFirst && nextReleaseTag &&
      (!flags.onlyFor || flags.onlyFor === nextReleaseTag.name) && flags.stopAt !== nextReleaseTag.name) {
      const config = di.get(CONFIG_TOKEN)
      await platform.makeReleaseForTag(
        nextReleaseTag,
        getPreviousRefForFirstRelease(config, nextReleaseTag.name)
      )
    }
  },
})
