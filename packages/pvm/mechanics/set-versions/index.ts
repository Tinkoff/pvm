import { isValidReleaseType } from '../../lib/semver-extra'
import { log } from '../../lib/logger'
import { Repository } from '../repository'
import type { AppliedPkg, Pkg } from '../../lib/pkg'
import { pkgsetFromFlags } from '../pkgset/pkgset'
import micromatch from 'micromatch'
import type { ReleaseType } from 'semver'
import semver from 'semver'
import type { PvmReleaseType } from '../../types'

export async function setVersions(opts: {
  versionOrReleaseType: PvmReleaseType | string,
  filterPath: string[],
  strategy: string,
  strategyOption: string[],
  updateDependants: boolean,
  bumpDependants: boolean,
}): Promise<void> {
  const { versionOrReleaseType } = opts
  if (!versionOrReleaseType) {
    throw new Error(`Provide release type or valid version as first argument`)
  }
  const isReleaseType = !/\d/.test(versionOrReleaseType.charAt(0))
  if (isReleaseType && !isValidReleaseType(versionOrReleaseType)) {
    throw new Error(`"${versionOrReleaseType}" is not valid release type`)
  }

  const { filterPath = [] } = opts

  log(`About to update packages using "${opts.strategy}" strategy`)
  if (filterPath.length) {
    log(`filtering packages by path by ${opts.filterPath.join(', ')} glob patterns`)
  }
  const repo = await Repository.init(process.cwd())
  const newVersions = new Map<Pkg, string>()

  for await (const pkg of pkgsetFromFlags(opts)) {
    if (filterPath.length && !micromatch.any(pkg.path, opts.filterPath, {})) {
      continue
    }

    let resultVersion: string | null = versionOrReleaseType

    if (isReleaseType) {
      if (versionOrReleaseType === 'none') {
        resultVersion = pkg.version
      } else {
        resultVersion = semver.inc(pkg.version, versionOrReleaseType as ReleaseType)
        if (resultVersion === null) {
          log.warn(`Could not increment version ${pkg.version} of ${pkg.name} with release type ${versionOrReleaseType}`)
        }
      }
    }

    if (resultVersion !== null) {
      newVersions.set(pkg, resultVersion)
    }
  }

  let appliedPackages: Iterable<AppliedPkg>

  if (opts.updateDependants) {
    log('updating dependants as well..')
    appliedPackages = repo.applyVersions(newVersions, {
      updateDependantsVersion: opts.bumpDependants,
    })
  } else {
    appliedPackages = Array.from(newVersions.entries()).map(([pkg, newVersion]) => pkg.applyVersion(newVersion))
  }

  for (const pkg of appliedPackages) {
    const originalPkg = !pkg.isRoot ? repo.pkgset.get(pkg.name) : repo.rootPkg
    pkg.save()
    log(`version for package "${pkg.name}" set to ${pkg.meta.version} (was ${originalPkg?.meta.version || 'unknown'})`)
  }
}
