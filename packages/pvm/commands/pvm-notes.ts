#!/usr/bin/env node

// команда обновляет release notes для последнего тэга через vcs

import { getConfig } from '../lib/config'
import { log } from '../lib/logger'
import initVcs from '../mechanics/vcs/index'
import { lastReleaseTag } from '../lib/git/last-release-tag'
import getPreviousRefForFirstRelease from '../lib/behaviors/previous-ref-for-initial-release'
import { makeReleaseForTagName } from '../lib/release-notes'
import { env } from '../lib/env'

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
