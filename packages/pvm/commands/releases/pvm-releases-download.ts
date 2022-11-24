#!/usr/bin/env node

import { download, ArtifactsStorages } from '../../mechanics/artifacts/pub/artifacts'

// eslint-disable-next-line node/no-extraneous-import
import type { Argv } from 'yargs'

export const command = 'download'
export const description = 'Download ReleaseList artifact from remote storage'
export const builder = (yargs: Argv) => {
  return yargs
    .option('quiet', {
      desc: `Don't print warnings`,
      type: 'boolean' as const,
      default: false,
    })
    .option('force', {
      desc: `Download an artifact even if it is not turned on`,
      type: 'boolean' as const,
      default: false,
    })
}

export const handler = main

async function main(args: Record<string, any>): Promise<void> {
  await download({
    force: args.force,
    quiet: args.quiet,
    kind: ArtifactsStorages.ReleaseList,
  })
}
