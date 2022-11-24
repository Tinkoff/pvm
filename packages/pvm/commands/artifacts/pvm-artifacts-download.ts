#!/usr/bin/env node

import type { ArtifactsTransferArgs } from '../../mechanics/artifacts/pub/artifacts'
import { download } from '../../mechanics/artifacts/pub/artifacts'
import { cliArtifactsChoices } from './common'

// eslint-disable-next-line node/no-extraneous-import
import type { Argv } from 'yargs'

export const command = 'download <kind>'
export const description = 'Download a given kind of artifacts from remote storage'
export const builder = (yargs: Argv) => {
  return yargs
    .positional('kind', {
      desc: 'Kind of artifact for downloading',
      type: 'string' as const,
      choices: cliArtifactsChoices,
    })
    .option('quiet', {
      desc: `Don't print warnings`,
      type: 'boolean' as const,
      default: false,
    })
    .option('force', {
      desc: `Download an artifact even if it is not turned on in config`,
      type: 'boolean' as const,
      default: false,
    })
}

export const handler = main

async function main(args: Record<string, any>): Promise<void> {
  await download(args as ArtifactsTransferArgs)
}
