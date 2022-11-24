import { prevReleaseTag, lastReleaseTag } from '../../lib/git/last-release-tag'
import { pkgsetFromRef } from '../pkgset/pkgset-from-ref'
import { getConfig } from '../../lib/config'
import revParse from '../../lib/git/rev-parse'
import gitCommits from '../../lib/git/commits'
import { logger } from '../../lib/logger'
import { wdShell } from '../../lib/shell'

import type { Config } from '../../types'
import type { PkgIdentity } from '../../mechanics/releases/types'

function changedPackagesFromRef(config: Config, ref: string): PkgIdentity[] {
  logger.silly(`calculate changed packages for ${ref}`)
  // @TODO: сделать оптимизацию для single-package репозиториев и особенно для single-package репозиториев которые берут свою версию из тэгов

  let pkgset = Array.from(pkgsetFromRef(config, ref))
  let prevRef

  logger.silly(`pkgset for ${ref}: ${pkgset.map(pkg => pkg.name)}`)

  try {
    prevRef = wdShell(config.cwd, `git rev-parse ${ref}^`)
  } catch (e) {
    logger.debug('prev ref does not exist')
  }

  if (prevRef) {
    const prevPkgset = Array.from(pkgsetFromRef(config, prevRef))
    pkgset = pkgset.filter(pkg => {
      const prevPkg = prevPkgset.find(prevPkg => prevPkg.name === pkg.name)
      const pkgChanged = !prevPkg || prevPkg.version !== pkg.version
      if (pkgChanged) {
        logger.silly(`include ${pkg.name}`)
      } else {
        logger.silly(`drop ${pkg.name} because previous version ${prevPkg!.version} is same to current version ${pkg.version}`)
      }
      return pkgChanged
    })
  }

  return pkgset.map(pkg => {
    return {
      name: pkg.name,
      version: pkg.version,
    }
  })
}

export interface GetCurrentReleaseOpts {
  ref?: string,
  cwd?: string,
}

// 1. commits in target release
// 2. packages[name, version] in target release
// 3. release name
export async function getCurrentRelease(opts: GetCurrentReleaseOpts = {}) {
  const { ref = 'HEAD', cwd = process.cwd() } = opts

  const config = await getConfig(cwd)

  const releaseTagName = lastReleaseTag(config, ref)

  // проверяем что ref -- релиз
  if (revParse(releaseTagName, cwd) !== revParse(ref, cwd)) {
    throw new Error(`Reference ${ref} is not release, sorry`)
  }

  const packages = changedPackagesFromRef(config, ref)
  const prevRef = prevReleaseTag(config, ref)

  const commits = await gitCommits(cwd, prevRef, ref)

  return {
    commits,
    packages,
    name: releaseTagName,
  }
}

if (require.main === module) {
  getCurrentRelease().then(releaseInfo => {
    console.log(require('util').inspect(releaseInfo, false, 4, true))
  })
}
