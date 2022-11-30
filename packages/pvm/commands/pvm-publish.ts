#!/usr/bin/env node

import { publish } from '../mechanics/publish'
import { flagsBuilder } from '../mechanics/publish/flags'
import type { Flags } from '../mechanics/publish/flags'
import type { Container } from '../lib/di'

export default (di: Container) => ({
  command: 'publish',
  description: 'Publish packages to npm registry',
  builder: flagsBuilder(di),

  handler: async function(flags: Flags): Promise<void> {
    const publishStats = await publish(di, flags)

    if (publishStats.error?.length) {
      process.exitCode = 1
    }
  },
})
