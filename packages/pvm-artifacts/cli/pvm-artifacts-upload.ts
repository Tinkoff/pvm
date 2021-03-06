#!/usr/bin/env node

import type { ArtifactsTransferArgs } from '../pub/artifacts'
import { upload } from '../pub/artifacts'
import { cliArtifactsChoices } from './common'

// eslint-disable-next-line node/no-extraneous-import
import type { Argv } from 'yargs'

export const command = 'upload <kind>'
export const description = 'Upload a given kind of artifacts from remote storage'
export const builder = (yargs: Argv) => {
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
}

export const handler = main

async function main(args: Record<string, any>): Promise<void> {
  await upload(args as ArtifactsTransferArgs)
}
