import chalk from 'chalk'
import { log } from '../../lib/logger'
import { makeChangelog } from '../../mechanics/changelog'
import { StorageManager } from '../../mechanics/artifacts/storage-manager'
import { releaseDataMaker } from '../../mechanics/releases/release-data'
import { getUpdateState } from '../../mechanics/update'
import { createReleaseContext } from '../../mechanics/update/release/release-context'

import type { ReleaseData } from '../../mechanics/releases/types'

import type { Container } from '../../lib/di'
import { CONFIG_TOKEN } from '../../tokens'
import type { CommandFactory } from '../../types/cli'

export default (di: Container): CommandFactory => builder => builder.command(
  'make',
  'Generate changelogs from ReleaseList artifact',
  (yargs) => {
    return yargs
      .option('append-upcoming-release', {
        desc: `Generate ReleasedData based on unreleased changes and count it in case incremental changelog renderering`,
        type: 'boolean' as const,
        default: false,
      })
  },
  async function main(flags): Promise<void> {
    log(chalk`{yellow Generating changelog}`)
    const config = di.get(CONFIG_TOKEN)

    const storageManager = new StorageManager({
      di,
    })

    const releaseListStorage = await storageManager.initFor(StorageManager.ArtifactsStorages.ReleaseList)
    await releaseListStorage.download()

    let releaseData: ReleaseData | undefined

    if (flags.appendUpcomingRelease) {
      const updateState = await getUpdateState(di, {
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
      await makeChangelog(di, releaseData)
    } else {
      log(`Changelog is not enabled. Exiting`)
    }

    await storageManager.finish()
  }
)
