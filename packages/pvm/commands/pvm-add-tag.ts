#!/usr/bin/env node

import { log } from '../lib/logger'
import { wdShell } from '../lib/shell'
import { getNewTag } from '../mechanics/add-tag/get-new-tag'
import type { Container } from '../lib/di'
import { CONFIG_TOKEN, PLATFORM_TOKEN } from '../tokens'

async function createTag(di: Container, tag, ref) {
  log(`creating tag ${tag} for ${ref} ref by platform api`)
  return di.get(PLATFORM_TOKEN).addTag(tag, ref)
}

export default (di: Container) => ({
  command: 'add-tag',
  description: 'Creates a new release tag via GitLab API based on commits made after the last release tag',
  builder: {},
  handler: async () => {
    const config = di.get(CONFIG_TOKEN)
    const targetRef = wdShell(config.cwd, 'git rev-parse HEAD')
    const newTag = await getNewTag(di, targetRef)
    if (newTag) {
      return createTag(di, newTag, targetRef)
    } else {
      log('new tag not calculated (see logs below)')
    }
  },
})
