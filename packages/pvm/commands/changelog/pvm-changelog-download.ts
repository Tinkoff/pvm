#!/usr/bin/env node

import { download, ArtifactsStorages } from '../../mechanics/artifacts/pub/artifacts'

// eslint-disable-next-line node/no-extraneous-import
import type { Argv } from 'yargs'
import type { Container } from '../../lib/di'

export default (di: Container) => ({
  command: 'download',
  description: 'Download Changelog artifacts from remote storage',
  builder: (yargs: Argv) => {
    return yargs
      .option('quiet', {
        desc: `Don't print warnings`,
        type: 'boolean' as const,
        default: false,
      })
      .option('force', {
        desc: `Download artifacts even if they are not turned on`,
        type: 'boolean' as const,
        default: false,
      })
  },

  handler: async function main(args: Record<string, any>): Promise<void> {
    await download(di, {
      force: args.force,
      quiet: args.quiet,
      kind: ArtifactsStorages.Changelogs,
    })
  },
})
