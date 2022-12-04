import type { ArtifactsTransferArgs } from '../../mechanics/artifacts/pub/artifacts'
import { upload } from '../../mechanics/artifacts/pub/artifacts'
import { cliArtifactsChoices } from './common'

import type { Container } from '../../lib/di'
import type { CommandFactory } from '../../types/cli'

export default (di: Container): CommandFactory => builder => builder.command(
  'upload <kind>',
  'Upload a given kind of artifacts from remote storage',
  (yargs) => {
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
  async function main(args: Record<string, any>): Promise<void> {
    await upload(di, args as ArtifactsTransferArgs)
  }
)
