#!/usr/bin/env node

import { publish } from '../../lib'
import type { Flags } from '../../lib/publish/flags'
import { flagsBuilder } from '../../lib/publish/flags'

export const command = 'publish'
export const description = 'Publish packages to npm registry'
export const builder = flagsBuilder

export const handler = async function(flags: Flags): Promise<void> {
  const publishStats = await publish(flags)

  if (publishStats.error?.length) {
    process.exitCode = 1
  }
}
