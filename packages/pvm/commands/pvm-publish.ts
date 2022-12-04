#!/usr/bin/env node

import { publish } from '../mechanics/publish'
import { flagsBuilder } from '../mechanics/publish/flags'
import type { Container } from '../lib/di'
import type { CommandFactory } from '../types'

export default (di: Container): CommandFactory => builder => builder.command(
  'publish',
  'Publish packages to npm registry',
  flagsBuilder(di),

  async function(flags): Promise<void> {
    const publishStats = await publish(di, flags)

    if (publishStats.error?.length) {
      process.exitCode = 1
    }
  }
)
