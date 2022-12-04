import { upload, ArtifactsStorages } from '../../mechanics/artifacts/pub/artifacts'

import type { Container } from '../../lib/di'
import type { CommandFactory } from '../../types/cli'

export default (di: Container): CommandFactory => builder => builder.command(
  'upload',
  'Upload Changelog artifacts to remote storage',
  (yargs) => {
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
  async function main(args): Promise<void> {
    await upload(di, {
      force: args.force,
      quiet: args.quiet,
      kind: ArtifactsStorages.Changelogs,
    })
  }
)
