#!/usr/bin/env node

import { download, ArtifactsStorages } from '../../mechanics/artifacts/pub/artifacts'

import type { Container } from '../../lib/di'
import type { CommandFactory } from '../../types/cli'

export default (di: Container): CommandFactory => builder => builder.command(
  'download',
  'Download Changelog artifacts from remote storage',
  (yargs) => {
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
  async function main(args): Promise<void> {
    await download(di, {
      force: args.force,
      quiet: args.quiet,
      kind: ArtifactsStorages.Changelogs,
    })
  }
)
