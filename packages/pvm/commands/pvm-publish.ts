#!/usr/bin/env node

import { publish } from '../mechanics/publish'
import { flagsBuilder } from '../mechanics/publish/flags'
import type { Flags } from '../mechanics/publish/flags'

export const command = 'publish'
export const description = 'Publish packages to npm registry'
export const builder = flagsBuilder

export const handler = async function(flags: Flags): Promise<void> {
  const publishStats = await publish(flags)

  if (publishStats.error?.length) {
    process.exitCode = 1
  }
}
