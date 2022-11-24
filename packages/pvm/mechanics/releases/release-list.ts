import path from 'path'
import fs from 'fs'
import ms from 'ms'
import bytes from 'bytes'
import { expDropRight } from '../../lib/utils/array'
import { makeReleasesFromWorkingTree } from './producers/releases-by-working-tree'
import { loggerFor } from '../../lib/logger'
import now from '../../lib/now'

import type { ReleaseData } from './types'
import type { Config, ArtifactLimitDef } from '../../types'

const logger = loggerFor('pvm:releases')

export const releaseListMaker = {
  fromWorkingTree: makeReleasesFromWorkingTree,
}

function reduceByDate(releaseList: ReleaseData[], milliseconds: number): ReleaseData[] {
  const rubiconDate = now().getTime() - milliseconds
  logger.info(`Reduce all releases before ${new Date(rubiconDate)}`)

  const testFn = (releaseData: ReleaseData): boolean => {
    return new Date(releaseData.created_at).getTime() >= rubiconDate
  }

  return expDropRight(releaseList, testFn)
}

function reduceBySize(releaseList: ReleaseData[], maxBytes: number): ReleaseData[] {
  logger.info(`Reduce all releases in order to have ${maxBytes} bytes maximum`)
  const overallSize = Buffer.byteLength(JSON.stringify(releaseList))
  if (overallSize <= maxBytes) {
    return releaseList
  }
  const averageEntitySize = overallSize / releaseList.length
  const reducedList = expDropRight(releaseList, (_, index) => {
    const count = index + 1
    return averageEntitySize * count <= maxBytes
  })

  return expDropRight(reducedList, (_, index) => {
    return Buffer.byteLength(JSON.stringify(reducedList.slice(0, index))) <= maxBytes
  })
}

export function limitReleaseList(releaseList: ReleaseData[], limit: ArtifactLimitDef): ReleaseData[] {
  if (limit.type === 'time') {
    return reduceByDate(releaseList, ms(limit.value))
  } else if (limit.type === 'size') {
    return reduceBySize(releaseList, bytes(limit.value))
  }
  throw new Error(`Unknown limit type ${limit.type}`)
}

export function reduceReleaseList(config: Config, releaseList: ReleaseData[]): ReleaseData[] {
  const reducedReleaseList = limitReleaseList(releaseList, config.release_list.limit)
  if (releaseList.length !== reducedReleaseList.length) {
    logger.info(`Reduced ReleaseList to new size ${reducedReleaseList.length} (was ${releaseList.length})`)
  }
  return reducedReleaseList
}

export function appendReleaseData(config: Config, releaseList: ReleaseData[], releaseData: ReleaseData): ReleaseData[] {
  logger.info(`Append ReleaseData to ReleaseList(size=${releaseList.length})`)
  releaseList.unshift(releaseData)

  return reduceReleaseList(config, releaseList)
}

export function fsAppendReleaseData(config: Config, releaseData: ReleaseData): void {
  const releaseListConfig = config.release_list
  if (!releaseListConfig.enabled) {
    return
  }
  const fullPath = path.join(config.cwd, releaseListConfig.path)
  let releaseList: ReleaseData[] = []
  if (fs.existsSync(fullPath)) {
    releaseList = JSON.parse(fs.readFileSync(fullPath, { encoding: 'utf-8' })) as unknown as ReleaseData[]
  }
  const reducedReleaseList = appendReleaseData(config, releaseList, releaseData)
  if (!config.executionContext.dryRun) {
    fs.writeFileSync(fullPath, JSON.stringify(reducedReleaseList))
  }
  logger.info(`ReleaseList(size=${reducedReleaseList.length}) has been written to "${releaseListConfig.path}"`)
}
