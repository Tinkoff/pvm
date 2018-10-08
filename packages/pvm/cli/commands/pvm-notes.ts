#!/usr/bin/env node

// команда обновляет release notes для последнего тэга через vcs

import { getConfig } from '@pvm/core/lib/config'
import { log } from '@pvm/core/lib/logger'
import initVcs from '@pvm/vcs'
import { lastReleaseTag } from '@pvm/core/lib/git/last-release-tag'
import getPreviousRefForFirstRelease from '@pvm/core/lib/behaviors/previous-ref-for-initial-release'
import { makeReleaseForTagName } from '@pvm/core/lib/release-notes'
import { env } from '@pvm/core/lib/env'

export const command = 'notes'
export const description = 'Create release notes for latest release tag based on commit messages between tags'
export const handler = pvmNotes

async function findPrevRef(targetTag: string) {
  const config = await getConfig()
  const prevRelease = lastReleaseTag(config, `${targetTag}^`)

  const prevRef = prevRelease || getPreviousRefForFirstRelease(config, targetTag)

  log(`previous release is ${prevRelease || '<not found, using previous commit>'}`)

  return prevRef
}

async function pvmNotes() {
  const config = await getConfig()
  const targetTagName = env.CI_COMMIT_TAG || lastReleaseTag(config)
  const vcs = await initVcs()

  if (!targetTagName) {
    throw new Error('at least one tag is required for making the release')
  }

  const prevRef = await findPrevRef(targetTagName)
  if (prevRef) {
    await makeReleaseForTagName(vcs, targetTagName, prevRef, {
      skipIfExists: true,
    })

    return targetTagName
  }
  return false
}
