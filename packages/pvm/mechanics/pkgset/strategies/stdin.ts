import { getWorkspacesSync } from '../../../lib/workspaces'
import { loadPkg } from '../../../lib/pkg'
import binarySearch from '../utils/binary-search'
import readLines from '../../../lib/read-lines'
import drainIterator from '../../../lib/iter/drain-items'
import { describeStrategy } from '../utils/describe-strategy'
import type { Container } from '../../../lib/di'
import { CONFIG_TOKEN } from '../../../tokens'

export type PkgsetStdinOpts = Partial<{
  cwd: string,
}>

async function * pkgset(di: Container, opts: PkgsetStdinOpts = {}) {
  const packagesNames = (await drainIterator(readLines())).sort()
  const pkgPaths = getWorkspacesSync(opts.cwd)
  const config = di.get(CONFIG_TOKEN)

  for (const pkgPath of pkgPaths) {
    const pkg = loadPkg(config, pkgPath)!
    if (binarySearch(packagesNames, n => pkg.name === n, n => pkg.name > n) !== -1) {
      yield pkg
    }
  }
}

describeStrategy(pkgset, 'stdin', 'Prints packages where name presented in process stdin')

export default pkgset
