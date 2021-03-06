#!/usr/bin/env node

import { log } from '@pvm/core/lib/logger'
import { getConfig } from '@pvm/core/lib/config'
import { wdShell } from '@pvm/core/lib/shell'
import { getNewTag } from '../lib'
import { initVcsPlatform } from '@pvm/vcs'

export const command = 'add-tag'
export const description = 'Creates a new release tag via GitLab API based on commits made after the last release tag'
export const builder = {}
export const handler = main

async function createTag(tag, ref) {
  const vcsPlatform = await initVcsPlatform({ vcsMode: 'platform' })

  log(`creating tag ${tag} for ${ref} ref by platform api`)
  return vcsPlatform.addTag(tag, ref)
}

async function main() {
  const config = await getConfig()
  const targetRef = wdShell(config.cwd, 'git rev-parse HEAD')
  const newTag = await getNewTag(config, targetRef)
  if (newTag) {
    return createTag(newTag, targetRef)
  } else {
    log('new tag not calculated (see logs below)')
  }
}
