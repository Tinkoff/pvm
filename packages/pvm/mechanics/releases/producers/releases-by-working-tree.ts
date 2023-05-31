import { lastReleaseTagIgnoreEnv } from '../../../lib/git/last-release-tag'
import { loggerFor } from '../../../lib/logger'
import { gitAuthorDate, isShallowRepository, revParse } from '../../../lib/git/commands'
import gitCommits from '../../../lib/git/commits'
import { changedFiles } from '../../pkgset/changed-files'
import { makeUpdateState } from '../../update'
import { pkgsetFromRef } from '../../pkgset/pkgset-from-ref'
import { ImmutablePkgSet } from '../../../lib/pkg-set'
import { isReleaseCommit } from '../../../lib/versioning'
import { UpdateReasonType } from '../../update/update-state'
import { ChangedContext } from '../../update/changed-context'
import { lookBackForReleaseTag, ReleasePosition } from '../rline'

import type { PkgReleaseEntry, ReleaseData, ReleaseDataExt } from '../../../mechanics/releases/types'
import type { Pkg } from '../../../lib/pkg'
import { env } from '../../../lib/env'
import type { Container } from '../../../lib/di'
import { CONFIG_TOKEN, CWD_TOKEN, HOST_API_TOKEN } from '../../../tokens'

export interface MakeReleasesFromWTOpts {
  stopAtRef?: string,
  startFrom?: string,
}

const PVM_TEST_DATE_NOW = env.PVM_TEST_DATE_NOW

function * releasedPackages(currentPackages: Iterable<Pkg>, prevPackages: ImmutablePkgSet): IterableIterator<Pkg> {
  for (const pkg of currentPackages) {
    const prevPkg = prevPackages.get(pkg.name)
    if (!prevPkg || pkg.version !== prevPkg.version) {
      yield pkg
    }
  }
}

const logger = loggerFor('pvm:releases')

async function makeReleasesFromWorkingTree(di: Container, opts: MakeReleasesFromWTOpts = {}): Promise<ReleaseData[]> {
  const { stopAtRef = void 0, startFrom = 'HEAD' } = opts
  const cwd = di.get(CWD_TOKEN)
  const config = di.get(CONFIG_TOKEN)

  let currentRef = startFrom
  const result: ReleaseDataExt[] = []

  const isShallow = isShallowRepository(cwd)

  let currentPackages: ImmutablePkgSet
  let prevPackages: ImmutablePkgSet | undefined

  const stopAtRev = stopAtRef ? revParse(stopAtRef, config.cwd) : void 0

  do {
    if (stopAtRev && revParse(currentRef, config.cwd) === stopAtRev) {
      logger.info(`reached stop ref ${stopAtRef}, exiting`)
      break
    }
    const releaseTag = lastReleaseTagIgnoreEnv(config, currentRef)
    if (!releaseTag) {
      break
    }
    const lookBackReleaseInfo = lookBackForReleaseTag(config, releaseTag, isShallow)

    if (lookBackReleaseInfo.releasePosition === ReleasePosition.shallow) {
      // полную информацию по релизу нельзя получить, мы здесь закончили
      logger.info(`Couldn't make ReleaseData for ${releaseTag}: repository is shallow. Run "git fetch --unshallow" before this operation if you want complete release list.`)
      break
    }

    currentPackages = prevPackages || new ImmutablePkgSet(pkgsetFromRef(config, currentRef))

    const targetRef = isReleaseCommit(config.cwd, releaseTag) ? `${releaseTag}^` : releaseTag
    const hostApi = di.get(HOST_API_TOKEN)

    if (lookBackReleaseInfo.releasePosition === ReleasePosition.following) {
      const prevReleaseTag = lookBackReleaseInfo.prevTagName
      const fromRef = prevReleaseTag
      const commits = await gitCommits(config.cwd, fromRef, targetRef)

      logger.info(`analyze commits from ${fromRef} to ${targetRef}`)

      const releaseNotes = await hostApi.commitsToNotes(commits)

      const affectedFiles = changedFiles({
        from: fromRef,
        to: targetRef,
        includeUncommited: false,
        cwd: config.cwd,
      })

      const changedContext = await ChangedContext.make(affectedFiles, {
        config,
      })

      const updateState = await makeUpdateState(di, changedContext)

      prevPackages = new ImmutablePkgSet(pkgsetFromRef(config, fromRef))

      const packages: PkgReleaseEntry[] = []

      for (const updatedPkg of releasedPackages(currentPackages, prevPackages)) {
        packages.push({
          name: updatedPkg.name,
          version: updatedPkg.version,
          updateReason: updateState.getUpdateReason(updatedPkg.name) || UpdateReasonType.unknown,
          changed: updateState.isPkgChangedOrNotFound(updatedPkg.name, true),
        })
      }

      const releaseData: ReleaseData = {
        title: releaseTag,
        description: releaseNotes,
        created_at: (PVM_TEST_DATE_NOW ? new Date(PVM_TEST_DATE_NOW) : gitAuthorDate(config.cwd, releaseTag)).toISOString(),
        tag_name: releaseTag,
        refs: [fromRef, targetRef],
        packages,
      }
      const attributedReleaseData = await hostApi.attributeReleaseData(releaseData, updateState)

      result.push(attributedReleaseData)

      currentRef = prevReleaseTag
    } else {
      const packages = currentPackages.map(pkg => {
        const pkgReleaseEntry: PkgReleaseEntry = {
          name: pkg.name,
          version: pkg.version,
          updateReason: UpdateReasonType.new,
          changed: true,
        }

        return pkgReleaseEntry
      })

      let releaseNotes = 'Initial release'

      try {
        const commits = await gitCommits(config.cwd, `${targetRef}^`, targetRef)
        releaseNotes = await hostApi.commitsToNotes(commits)
      } catch (e) {
        // pass
      }

      const attributedReleaseData = await hostApi.attributeReleaseData({
        title: releaseTag,
        description: releaseNotes,
        created_at: (PVM_TEST_DATE_NOW ? new Date(PVM_TEST_DATE_NOW) : gitAuthorDate(config.cwd, releaseTag)).toISOString(),
        tag_name: releaseTag,
        refs: ['', targetRef],
        packages,
      }, null)
      result.push(attributedReleaseData)
      break
    }
  } while (currentRef)

  return result
}

export {
  makeReleasesFromWorkingTree,
}
