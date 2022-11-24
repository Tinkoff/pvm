import semver from 'semver'
import { matchAny, matchGroup } from '../../lib/pkg-match'
import sortByRelease from '../../lib/packages/sort-by-release'
import { loggerFor } from '../../lib/logger'
import { releaseTypes as releaseTypesMath } from '../../lib/semver-extra'
import { UpdateReasonType } from './update-state'

import type { Pkg } from '../../lib/pkg'
import type { PvmReleaseType, SemverReleaseType } from '../../types'
import type { Repository } from '../repository'
import type { UpdateState } from './update-state'
import { decreaseReleaseTypeForPackagesWithZeroMajorVersion } from './pkg-release-type'

const logger = loggerFor('pvm:dependants-updater')

export async function processAffectedByDependants(repo: Repository, updateState: UpdateState, targetPackages: Iterable<Pkg>): Promise<Pkg[]> {
  const dependantsTree = repo.dependantsTree
  const { hints } = await repo.hintsContext()
  const releaseTypes: Required<typeof hints>['release-types'] = hints['release-types'] || {}

  const upConfig = hints['update-dependants-for'] || []
  const seenPackages = Object.create(null)

  const newChanged: Pkg[] = []

  function walkTreeAndUpVersion(targetPkg: Pkg, releaseType: PvmReleaseType, maxDepth: number, changeByTrack: Pkg[] = []): void {
    const currentDepth = changeByTrack.length
    if (currentDepth >= maxDepth || (targetPkg.name in seenPackages)) {
      return
    }
    seenPackages[targetPkg.name] = 1

    for (const pkg of (dependantsTree.get(targetPkg) || [])) {
      (updateState.updateDepsFor as Set<Pkg>).add(pkg)
      const haveRelease = updateState.hasNewVersionOrReleaseType(pkg)

      const hintReleaseType = matchGroup(pkg, releaseTypes)
      let pkgReleaseTypes: PvmReleaseType[] = hintReleaseType ? [hintReleaseType, releaseType] : [releaseType]
      if (repo.config.update.respect_zero_major_version) {
        pkgReleaseTypes = pkgReleaseTypes.map(t => decreaseReleaseTypeForPackagesWithZeroMajorVersion(pkg.version, t))
      }
      if (updateState.wantedReleaseTypes.has(pkg)) {
        pkgReleaseTypes.push(updateState.wantedReleaseTypes.get(pkg)!)
      }

      const maybeReleaseType = releaseTypesMath.max(...pkgReleaseTypes)
      const possibleNewVersion = maybeReleaseType && maybeReleaseType !== 'none' ? semver.inc(pkg.version, maybeReleaseType) : null

      if (possibleNewVersion && (!updateState.newVersions.has(pkg) || semver.gt(possibleNewVersion, updateState.newVersions.get(pkg)!))) {
        updateState.wantedReleaseTypes.set(pkg, maybeReleaseType)
      }

      if (!haveRelease) {
        updateState.updateReasonMap.set(pkg, UpdateReasonType.dependant)
        // для пакета pkg выставляем от каких реально измененных пакетов он зависел
        // чтобы в дальнейшем по ним выставить release notes например
        updateState.dependantOfMap.set(pkg, changeByTrack.concat(targetPkg).reduce((acc, trackedPkg) => {
          if (updateState.changedContext.packages.has(trackedPkg.name)) {
            acc.push(trackedPkg)
          }
          return acc
        }, [] as Pkg[]))
        newChanged.push(pkg)
      }
      walkTreeAndUpVersion(pkg, releaseType, maxDepth, changeByTrack.concat(targetPkg))
    }
  }

  const sortedChangedPackages = sortByRelease(targetPackages, updateState.getLikelyReleaseTypeFor.bind(updateState))

  for (const upEntry of upConfig) {
    for (const pkg of sortedChangedPackages) {
      const matchExpr = upEntry['match']
      let releaseType: PvmReleaseType | null | 'as-dep' = upEntry['release-type']
      const maxDepth = upEntry['max-depth'] || Infinity

      const patterns: ReadonlyArray<string> = typeof matchExpr === 'string' ? [matchExpr] : matchExpr

      if (matchAny(pkg, patterns)) {
        const hostReleaseType: SemverReleaseType | null = updateState.getLikelyReleaseTypeFor(pkg)
        if (releaseType === 'as-dep') {
          // если версия не менялась releaseType будет null
          releaseType = hostReleaseType
        }
        // обновляем зависимые только если меняется версия у исходного
        // 1. В случае новых пакетов это не имеет смысл, т.к. при добавлении зависимости в зависимый пакет ты обновишь его явно
        // 2. Если же пакет просто остается с той же версии, какой смысл релизить зависимый от него ?
        if (hostReleaseType) {
          walkTreeAndUpVersion(pkg, releaseType || 'patch', maxDepth)
        } else {
          logger.debug(`skip update dependants for ${pkg.name}, because it doesn't have release type`)
        }
      }
    }
  }

  return newChanged
}
