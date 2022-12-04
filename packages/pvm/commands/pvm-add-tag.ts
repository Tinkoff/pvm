#!/usr/bin/env node

import { log } from '../lib/logger'
import { wdShell } from '../lib/shell'
import { getNewTag } from '../mechanics/add-tag/get-new-tag'
import type { Container } from '../lib/di'
import { CONFIG_TOKEN, PLATFORM_TOKEN } from '../tokens'
import type { CommandFactory } from '../types/cli'

async function createTag(di: Container, tag: string, ref: string) {
  log(`creating tag ${tag} for ${ref} ref by platform api`)
  return di.get(PLATFORM_TOKEN).addTag(tag, ref)
}

export default (di: Container): CommandFactory => (builder) => builder.command(
  'add-tag',
  'Creates a new release tag via GitLab API based on commits made after the last release tag',
  {},
  async () => {
    const config = di.get(CONFIG_TOKEN)
    const targetRef = wdShell(config.cwd, 'git rev-parse HEAD')
    const newTag = await getNewTag(di, targetRef)
    if (newTag) {
      return createTag(di, newTag, targetRef)
    } else {
      log('new tag not calculated (see logs below)')
    }
  }
)
