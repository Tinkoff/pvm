#!/usr/bin/env node

import chalk from 'chalk'
import initVcs from '../../mechanics/vcs'
import { log } from '../../lib/logger'
import { makeChangelog } from '../../mechanics/changelog'
import { getConfig } from '../../lib/config'
import { StorageManager } from '../../mechanics/artifacts/storage-manager'
import { releaseDataMaker } from '../../mechanics/releases/release-data'
import { getUpdateState } from '../../mechanics/update'
import { createReleaseContext } from '../../mechanics/update/release/release-context'

import type { ReleaseData } from '../../mechanics/releases/types'
// eslint-disable-next-line node/no-extraneous-import
import type { Argv } from 'yargs'

export const command = 'make'
export const description = 'Generate changelogs from ReleaseList artifact'
export const builder = (yargs: Argv) => {
  return yargs
    .option('append-upcoming-release', {
      desc: `Generate ReleasedData based on unreleased changes and count it in case incremental changelog renderering`,
      type: 'boolean' as const,
      default: false,
    })
}
export const handler = main

async function main(flags: Record<string, any>): Promise<void> {
  log(chalk`{yellow Generating changelog}`)
  const cwd = process.cwd()
  const config = await getConfig(cwd)
  const vcs = await initVcs({
    vcsType: 'fs',
    cwd,
  })

  const storageManager = new StorageManager({
    config,
    vcs,
  })

  const releaseListStorage = await storageManager.initFor(StorageManager.ArtifactsStorages.ReleaseList)
  await releaseListStorage.download()

  let releaseData: ReleaseData | undefined

  if (flags.appendUpcomingRelease) {
    const updateState = await getUpdateState({
      includeUncommited: true,
    })

    const releaseContext = await createReleaseContext(updateState)
    if (releaseContext) {
      releaseData = await releaseDataMaker.fromReleaseContext(releaseContext)
    }
  }

  const changelogsStorage = await storageManager.initFor(StorageManager.ArtifactsStorages.Changelogs)

  if ((config.changelog.enabled || config.changelog.for_packages.enabled)) {
    await changelogsStorage.download()
    await makeChangelog(config, releaseData)
  } else {
    log(`Changelog is not enabled. Exiting`)
  }

  await storageManager.finish()
}
