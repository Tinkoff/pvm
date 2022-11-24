import path from 'path'
import { logger } from '../../lib/logger'
import { releaseDataMaker } from '../../mechanics/releases/release-data'
import { getUpdateState } from '../../mechanics/update'
import { createReleaseContext } from '../../mechanics/update/release/release-context'

// eslint-disable-next-line node/no-extraneous-import
import type { Argv } from 'yargs'
import type { Container } from '../../lib/di'

export default (di: Container) => ({
  command: 'probe',
  description: 'Create ReleaseData artefact based on unreleased changes',
  builder: (yargs: Argv) => {
    return yargs
      .option('output-path', {
        desc: 'Output path for ReleaseData artefact',
        type: 'string' as const,
        default: 'releaseData.json',
      })
  },
  handler: async function main(flags: Record<string, any>): Promise<void> {
    const fs = require('fs')
    const cwd = process.cwd()

    const updateState = await getUpdateState(di, {
      includeUncommited: true,
    })

    const releaseContext = await createReleaseContext(updateState)
    if (releaseContext) {
      const releaseData = await releaseDataMaker.fromReleaseContext(releaseContext, {
        allowWithoutCommits: true,
        emptyReleaseNotes: 'Uncommited changes',
      })

      if (releaseData) {
        const outputPath = path.resolve(cwd, flags.outputPath)
        fs.writeFileSync(outputPath, JSON.stringify(releaseData))
        logger.info(`ReleaseData saved to "${flags.outputPath}"`)
      } else {
        logger.info(`ReleaseData has not been created`)
      }
    }
  },
})
