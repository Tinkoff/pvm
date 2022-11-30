import path from 'path'
import { logger } from '../../lib/logger'
import { makeReleasesFromWorkingTree } from '../../mechanics/releases/producers/releases-by-working-tree'
import { releaseDataMaker } from '../../mechanics/releases/release-data'
import { reduceReleaseList } from '../../mechanics/releases/release-list'
import { getUpdateState } from '../../mechanics/update'
import { createReleaseContext } from '../../mechanics/update/release/release-context'

// eslint-disable-next-line node/no-extraneous-import
import type { Argv } from 'yargs'
import type { Container } from '../../lib/di'
import { CONFIG_TOKEN, CWD_TOKEN } from '../../tokens'

export default (di: Container) => ({
  command: 'make',
  description: 'Make ReleaseList artifact from git working tree',
  builder: (yargs: Argv) => {
    return yargs
      .option('start-from', {
        desc: 'Git reference from wich start iteration',
        type: 'string' as const,
        default: 'HEAD',
      })
      .option('stop-at', {
        desc: 'Git reference at which to stop iteration',
        type: 'string' as const,
      })
      .option('append-upcoming-release', {
        desc: `Generate ReleasedData based on unreleased changes and append it to ReleaseList`,
        type: 'boolean' as const,
        default: false,
      })
      .option('limit', {
        desc: 'limit ReleaseList artefact according to configuration',
        type: 'boolean' as const,
        default: true,
      })
  },
  handler: async function main(flags: Record<string, any>): Promise<void> {
    const fs = require('fs')
    const cwd = di.get(CWD_TOKEN)
    const config = di.get(CONFIG_TOKEN)

    let releaseList = await makeReleasesFromWorkingTree(di, {
      stopAtRef: flags.stopAt,
      startFrom: flags.startFrom,
    })

    if (flags.appendUpcomingRelease) {
      const updateState = await getUpdateState(di, {
        includeUncommited: true,
      })

      const releaseContext = await createReleaseContext(updateState)
      if (releaseContext) {
        const releaseData = await releaseDataMaker.fromReleaseContext(releaseContext)

        if (releaseData) {
          releaseList.unshift(releaseData)
        }
      }
    }

    if (flags.limit) {
      logger.info('Limit ReleaseList according to corresponding configuration')
      releaseList = reduceReleaseList(config, releaseList)
    }

    logger.info(`Produced ${releaseList.length} releases`)

    const outputPath = path.join(cwd, config.release_list.path)
    fs.writeFileSync(outputPath, JSON.stringify(releaseList))
    logger.info(`Release list saved to "${config.release_list.path}"`)
  },
})