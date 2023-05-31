import type { ArtifactsTransferArgs } from '../../mechanics/artifacts/pub/artifacts'
import { download } from '../../mechanics/artifacts/pub/artifacts'
import { cliArtifactsChoices } from './common'

// eslint-disable-next-line node/no-extraneous-import
import type { Argv } from 'yargs'
import type { Container } from '../../lib/di'
import type { CommandFactory } from '../../types/cli'

export default (di: Container): CommandFactory => builder => builder.command(
  'download <kind>',
  'Download a given kind of artifacts from remote storage',
  (yargs: Argv) => {
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
  },
  async function main(args): Promise<void> {
    await download(di, args as ArtifactsTransferArgs)
  }
)
