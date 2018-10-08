import { lastReleaseTag as getLastReleaseTag } from '@pvm/core/lib/git/last-release-tag'
import { wdShell } from '@pvm/core/lib/shell'
import { pkgsetFromRef } from '../pkgset-from-ref'
import { loggerFor } from '@pvm/core/lib/logger'
import type { Pkg } from '@pvm/core/lib/pkg'
import { getConfig } from '@pvm/core/lib/config'
import { describeStrategy } from '../utils/describe-strategy'
import { ImmutablePkgSet } from '@pvm/core/lib/pkg-set'
const logger = loggerFor('pvm:pkgset-released')

export interface PkgsetReleasedOpts {
  ref?: string,
  cwd?: string,
}

async function * pkgsetReleased(opts: PkgsetReleasedOpts = {}): AsyncIterableIterator<Pkg> {
  const { ref = 'HEAD', cwd = process.cwd() } = opts
  const config = await getConfig(cwd)

  const lastReleaseTag = getLastReleaseTag(config, ref)
  if (!lastReleaseTag) {
    // если вообще не было релизов, значит возвращаем пустой список
    return
  }
  logger.debug('last release tag is', lastReleaseTag)

  const pkgsetFromLastRelease = pkgsetFromRef(config, lastReleaseTag)

  let compareToRef
  const prevReleaseTag = getLastReleaseTag(config, `${lastReleaseTag}^`)
  if (!prevReleaseTag) {
    let prevRef
    try {
      prevRef = wdShell(cwd, `git rev-parse ${lastReleaseTag}^`)
    } catch (e) {
      // pass
    }
    if (!prevRef) {
      logger.debug(`there is no prevRef, return all packages from ${lastReleaseTag}`)
      // если у нас вообще единственный коммит в истории, значит сравнивать не с чем, поэтому отдаем все что есть
      yield * pkgsetFromLastRelease
      return
    } else {
      compareToRef = prevRef
    }
  } else {
    compareToRef = prevReleaseTag
  }
  logger.debug('compare to ref:', compareToRef)
  const prevPackages = new ImmutablePkgSet(pkgsetFromRef(config, compareToRef))

  for (const pkg of pkgsetFromLastRelease) {
    // емитим только те пакеты, которые поменяли версию
    const prevPkg = prevPackages.get(pkg.name)
    if (!prevPkg || pkg.version !== prevPkg.version) {
      yield pkg
    }
  }
}

describeStrategy(pkgsetReleased, 'released', 'Prints all packages that changed their version in last release (or all packages if release was in the first commit)')

export default pkgsetReleased
