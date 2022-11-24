import chalk from 'chalk'
import semver from 'semver'

import { logger } from '../../../lib/logger'
import { getWorkspacesSync } from '../../../lib/workspaces'
import type { Pkg } from '../../../lib/pkg'
import { loadPkg } from '../../../lib/pkg'
import { wdShell } from '../../../lib/shell'
import type { Container } from '../../../lib/di'
import { describeStrategy } from '../utils/describe-strategy'
import { CONFIG_TOKEN } from '../../../tokens'

export type PkgsetStaleOpts = Partial<{
  cwd: string,
  registry: string,
}>

async function * pkgset(di: Container, opts: PkgsetStaleOpts = {}): AsyncIterableIterator<Pkg> {
  const pkgPaths = getWorkspacesSync(opts.cwd)
  const config = di.get(CONFIG_TOKEN)

  for (const pkgPath of pkgPaths) {
    const pkg = loadPkg(config, pkgPath)!
    const registry = (pkg.meta.publishConfig ? pkg.meta.publishConfig.registry : null) || opts.registry
    let response
    let publishedVersion = null

    try {
      // @TODO сделать параллельные запросы в нпм (ускорить)
      logger.info(`retrieving published version for ${pkg.name} from ${registry || 'default'} registry..`)
      response = wdShell(config.cwd, `npm view ${pkg.name} version ${registry ? `--registry ${registry}` : ''}`, { stdio: 'pipe' })
    } catch (e) {
      // According https://github.com/npm/cli/issues/3075 there is a flag --json behaviour change that defeats its purpose
      // and making output unparsable as json
      if (e.toString().indexOf(' E404') === -1) {
        logger.error(`Failed while retrieving actual version for "${pkg.name}" from registry "${registry || 'default'}"`)
        throw e
      }
    }

    if (response) {
      publishedVersion = response
    }

    const isStale = publishedVersion === null || semver.gt(pkg.version, publishedVersion)
    logger.debug(`package "${pkg.name}"${isStale ? ' (stale)' : ''}: published version is ${publishedVersion}, current version is ${pkg.version}`)
    if (isStale) {
      yield pkg
    }
  }
}

describeStrategy(pkgset, 'stale', chalk`Prints packages where version is greater than published one or not published at all.

    Options:
      {yellow registry}: Override registry option. By default used from package.json/publishConfig config`)

export default pkgset
