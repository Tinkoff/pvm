import path from 'path'
import { logger } from '@pvm/core/lib/logger'
import { getConfig } from '@pvm/core/lib/config'
import { makeReleasesFromWorkingTree } from '../lib/producers/releases-by-working-tree'
import { releaseDataMaker } from '../lib/release-data'
import { reduceReleaseList } from '../lib/release-list'
import { getUpdateState } from '@pvm/update/lib'
import { createReleaseContext } from '@pvm/update/lib/release/release-context'

// eslint-disable-next-line node/no-extraneous-import
import type { Argv } from 'yargs'

export const command = 'make'
export const description = 'Make ReleaseList artifact from git working tree'
export const builder = (yargs: Argv) => {
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
}

export const handler = main

async function main(flags: Record<string, any>): Promise<void> {
  const fs = require('fs')
  const cwd = process.cwd()
  const config = await getConfig(cwd)

  let releaseList = await makeReleasesFromWorkingTree(cwd, {
    stopAtRef: flags.stopAt,
    startFrom: flags.startFrom,
  })

  if (flags.appendUpcomingRelease) {
    const updateState = await getUpdateState({
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
