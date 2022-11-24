import { log, logger } from '../../lib/logger'
import { matchAny } from '../../lib/pkg-match'
import gitLog from '../../lib/git/log'
import { getHostApi } from '../../lib/plugins'
import { processAffectedByDependants } from './dependants-updater'
import { PkgSet } from '../../lib/pkg-set'

import type { Pkg } from '../../lib/pkg'
import type { UpdateState } from './update-state'
import type { Repository } from '../repository'
import type { ForceReleaseState } from './types'

async function releaseNotesByFile(cwd: string, filePath: string, defaultMessage: string): Promise<string> {
  const latestCommits = await gitLog({
    _: [filePath],
    'no-merges': true,
    '1': true,
  }, { cwd })
  if (latestCommits.length === 0) {
    return defaultMessage
  }
  const hostApi = await getHostApi(cwd)
  return hostApi.commitsToNotes(latestCommits)
}

// could add new packages from hints['force-release'] directive
async function processForceRelease(updateState: UpdateState): Promise<ForceReleaseState> {
  const packages = new PkgSet()
  const { cwd } = updateState.repo
  const { hints } = updateState.updateContext
  const { changedContext } = updateState

  const forceRelease = hints['force-release']
  if (forceRelease) {
    const { packages: packagesMasks = [] } = forceRelease
    logger.debug(`found force-release record, packages mask:`, packagesMasks)
    const defaultReleaseNotes = 'force release by update-hints.toml'
    const releaseNotes = forceRelease['release-notes'] || (await releaseNotesByFile(cwd, 'update-hints.toml', defaultReleaseNotes))

    logger.debug('already changed packages:', Array.from(changedContext.packages.keys()))

    const allPackages = updateState.repo.packagesMaybeWithRoot

    for (const pkg of allPackages) {
      if (!changedContext.packages.has(pkg.name) && matchAny(pkg, packagesMasks)) {
        logger.debug(`force release ${pkg.name}`)
        updateState.releaseNotes.set(pkg, releaseNotes)
        packages.add(pkg)
      }
    }
    return {
      packages: packages.freeze(),
      defaultReleaseType: forceRelease['release-type'] || 'patch',
    }
  }

  return {
    packages: packages.freeze(),
  }
}

// could add new packages from hints['update-dependants-for'] directive
// note: hints['update-dependants-for'] is smart field, and it will be populated in case if config.update.update_dependants = true
async function enrichByDependants(repo: Repository, updateState: UpdateState, packages: Iterable<Pkg>): Promise<Pkg[]> {
  const { hints } = updateState.updateContext
  if (hints['update-dependants-for']) {
    log(`update dependants`)
    logger.debug(`final update dependants config:\n${JSON.stringify(hints['update-dependants-for'], null, 2)}`)

    return processAffectedByDependants(repo, updateState, packages)
  }
  return []
}

export {
  enrichByDependants,
  processForceRelease,
}
