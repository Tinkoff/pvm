#!/usr/bin/env node

// команда обновляет release notes для последнего тэга через vcs

import { log } from '../lib/logger'
import initVcs from '../mechanics/vcs/index'
import { lastReleaseTag } from '../lib/git/last-release-tag'
import getPreviousRefForFirstRelease from '../lib/behaviors/previous-ref-for-initial-release'
import { makeReleaseForTagName } from '../lib/release-notes'
import { env } from '../lib/env'
import type { Container } from '../lib/di'
import { CONFIG_TOKEN } from '../tokens'
import type { Config } from '../types/config'

async function findPrevRef(config: Config, targetTag: string) {
  const prevRelease = lastReleaseTag(config, `${targetTag}^`)

  const prevRef = prevRelease || getPreviousRefForFirstRelease(config, targetTag)

  log(`previous release is ${prevRelease || '<not found, using previous commit>'}`)

  return prevRef
}

export default (di: Container) => ({
  command: 'notes',
  description: 'Create release notes for latest release tag based on commit messages between tags',
  handler: async function pvmNotes() {
    const config = di.get(CONFIG_TOKEN)
    const targetTagName = env.CI_COMMIT_TAG || lastReleaseTag(config)
    const vcs = await initVcs(di)

    if (!targetTagName) {
      throw new Error('at least one tag is required for making the release')
    }

    const prevRef = await findPrevRef(di.get(CONFIG_TOKEN), targetTagName)
    if (prevRef) {
      await makeReleaseForTagName(vcs, targetTagName, prevRef, {
        skipIfExists: true,
      })

      return targetTagName
    }
    return false
  },
})
