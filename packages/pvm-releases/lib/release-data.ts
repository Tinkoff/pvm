import now from '@pvm/core/lib/now'
import { UpdateReasonType } from '@pvm/update/lib/update-state'
import { getPersistentRef } from '@pvm/core/lib/git/commands'

import type { ReleaseData, ReleaseDataExt } from '../types'
import type { ReleaseContext } from '@pvm/update/types'

export interface ReleaseDataMakerOpts {
  dateNow?: Date,
  allowWithoutCommits?: boolean,
  emptyReleaseNotes?: string,
}

export const releaseDataMaker = {
  async fromReleaseContext(releaseContext: ReleaseContext, opts: ReleaseDataMakerOpts = {}): Promise<ReleaseDataExt | undefined> {
    const { updateState } = releaseContext
    const { dateNow = now(), allowWithoutCommits = false, emptyReleaseNotes = 'Technical release' } = opts

    if (updateState.changedContext.commits.length !== 0 || allowWithoutCommits) {
      const { config } = updateState.repo
      const packages = Array.from(releaseContext.updateState.getReleasePackages().values()).map(pkg => {
        return {
          name: pkg.name,
          version: pkg.version,
          updateReason: updateState.getUpdateReason(pkg.name) || UpdateReasonType.unknown,
          changed: updateState.isPkgChanged(pkg.name),
        }
      })

      const hostApi = await releaseContext.updateState.repo.getHostApi()

      const releaseData: ReleaseData = {
        title: releaseContext.name,
        tag_name: releaseContext.releaseTag,
        created_at: dateNow.toISOString(),
        description: releaseContext.releaseNotes || emptyReleaseNotes,
        packages,
        refs: [
          getPersistentRef(config, updateState.changedContext.fromRef),
          getPersistentRef(config, updateState.changedContext.targetRef),
        ],
      }

      return await hostApi.attributeReleaseData(releaseData, updateState)
    }
  },
}
