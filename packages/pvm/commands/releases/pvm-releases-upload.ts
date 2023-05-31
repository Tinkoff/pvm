import { upload, ArtifactsStorages } from '../../mechanics/artifacts/pub/artifacts'

import type { Container } from '../../lib/di'
import type { CommandFactory } from '../../types'

export default (di: Container): CommandFactory => builder => builder.command(
  'upload',
  'Upload ReleaseList artifact to remote storage',
  (yargs) => {
    return yargs
      .option('quiet', {
        desc: `Don't print warnings`,
        type: 'boolean' as const,
        default: false,
      })
      .option('force', {
        desc: `Upload an artifact even if it is not turned on`,
        type: 'boolean' as const,
        default: false,
      })
  },

  async function main(args: Record<string, any>): Promise<void> {
    await upload(di, {
      force: args.force,
      quiet: args.quiet,
      kind: ArtifactsStorages.ReleaseList,
    })
  }
)
