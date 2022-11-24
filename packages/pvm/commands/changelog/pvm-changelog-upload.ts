#!/usr/bin/env node

import { upload, ArtifactsStorages } from '../../mechanics/artifacts/pub/artifacts'

// eslint-disable-next-line node/no-extraneous-import
import type { Argv } from 'yargs'
import type { Container } from '../../lib/di'

export default (di: Container) => ({
  command: 'upload',
  description: 'Upload Changelog artifacts to remote storage',
  builder: (yargs: Argv) => {
    return yargs
      .option('quiet', {
        desc: `Don't print warnings`,
        type: 'boolean' as const,
        default: false,
      })
      .option('force', {
        desc: `Upload artifacts even they are not turned on`,
        type: 'boolean' as const,
        default: false,
      })
  },
  handler: async function main(args: Record<string, any>): Promise<void> {
    await upload(di, {
      force: args.force,
      quiet: args.quiet,
      kind: ArtifactsStorages.Changelogs,
    })
  },
})
