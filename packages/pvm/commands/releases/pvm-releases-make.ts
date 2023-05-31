import path from 'path'
import { logger } from '../../lib/logger'
import { makeReleasesFromWorkingTree } from '../../mechanics/releases/producers/releases-by-working-tree'
import { releaseDataMaker } from '../../mechanics/releases/release-data'
import { reduceReleaseList } from '../../mechanics/releases/release-list'
import { getUpdateState } from '../../mechanics/update'
import { createReleaseContext } from '../../mechanics/update/release/release-context'

import type { Container } from '../../lib/di'
import { CONFIG_TOKEN, CWD_TOKEN } from '../../tokens'
import type { CommandFactory } from '../../types'

export default (di: Container): CommandFactory => builder => builder.command(
  'make',
  'Make ReleaseList artifact from git working tree',
  (yargs) => {
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
  async function main(flags): Promise<void> {
    const fs = require('fs')
    const cwd = di.get(CWD_TOKEN)
    const config = di.get(CONFIG_TOKEN)

    let releaseList = await makeReleasesFromWorkingTree(di, {
      stopAtRef: flags['stop-at'],
      startFrom: flags['start-from'],
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
  }
)
