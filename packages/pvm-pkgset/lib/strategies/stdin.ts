import { getWorkspacesSync } from '@pvm/core/lib/workspaces'
import { loadPkg } from '@pvm/core/lib/pkg'
import { getConfig } from '@pvm/core/lib/config'
import binarySearch from '../utils/binary-search'
import readLines from '@pvm/core/lib/read-lines'
import drainIterator from '@pvm/core/lib/iter/drain-items'
import { describeStrategy } from '../utils/describe-strategy'

export type PkgsetStdinOpts = Partial<{
  cwd: string,
}>

async function * pkgset(opts: PkgsetStdinOpts = {}) {
  const packagesNames = (await drainIterator(readLines())).sort()
  const pkgPaths = getWorkspacesSync(opts.cwd)
  const config = await getConfig(opts.cwd)

  for (const pkgPath of pkgPaths) {
    const pkg = loadPkg(config, pkgPath)!
    if (binarySearch(packagesNames, n => pkg.name === n, n => pkg.name > n) !== -1) {
      yield pkg
    }
  }
}

describeStrategy(pkgset, 'stdin', 'Prints packages where name presented in process stdin')

export default pkgset
