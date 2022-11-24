import { getConfig } from '../../../lib/config'
import { describeStrategy } from '../utils/describe-strategy'
import { pkgsetAll } from '../pkgset-all'
import type { PkgsetAllOpts } from '../pkgset-all'
import type { Pkg } from '../../../lib/pkg'

export interface PkgsetAsyncAllOpts extends PkgsetAllOpts {
  cwd?: string,
}

async function * pkgset(opts: PkgsetAsyncAllOpts = {}): AsyncIterableIterator<Pkg> {
  const { cwd, ...restOpts } = opts
  const config = await getConfig(cwd)
  yield * pkgsetAll(config, restOpts)
}

describeStrategy(pkgset, 'all', 'Prints all packages presented in monorepo')

export default pkgset
