#!/usr/bin/env node

import type { ArtifactsTransferArgs } from '../../mechanics/artifacts/pub/artifacts'
import { upload } from '../../mechanics/artifacts/pub/artifacts'
import { cliArtifactsChoices } from './common'

// eslint-disable-next-line node/no-extraneous-import
import type { Argv } from 'yargs'
import type { Container } from '../../lib/di'

export default (di: Container) => ({
  command: 'upload <kind>',
  description: 'Upload a given kind of artifacts from remote storage',
  builder: (yargs: Argv) => {
    return yargs
      .positional('kind', {
        desc: 'Kind of artifact for uploading',
        type: 'string' as const,
        choices: cliArtifactsChoices,
      })
      .option('quiet', {
        desc: `Don't print warnings`,
        type: 'boolean' as const,
        default: false,
      })
      .option('force', {
        desc: `Upload artifacts even if they are not turned on in config`,
        type: 'boolean' as const,
        default: false,
      })
  },
  handler: async function main(args: Record<string, any>): Promise<void> {
    await upload(di, args as ArtifactsTransferArgs)
  },
})
