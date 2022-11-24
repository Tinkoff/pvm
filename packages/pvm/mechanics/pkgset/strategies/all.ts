import { describeStrategy } from '../utils/describe-strategy'
import { pkgsetAll } from '../pkgset-all'
import type { PkgsetAllOpts } from '../pkgset-all'
import type { Pkg } from '../../../lib/pkg'
import type { Container } from '../../../lib/di'
import { CONFIG_TOKEN } from '../../../tokens'

export interface PkgsetAsyncAllOpts extends PkgsetAllOpts {
  cwd?: string,
}

async function * pkgset(di: Container, opts: PkgsetAsyncAllOpts = {}): AsyncIterableIterator<Pkg> {
  const { cwd, ...restOpts } = opts
  const config = di.get(CONFIG_TOKEN)
  yield * pkgsetAll(config, restOpts)
}

describeStrategy(pkgset, 'all', 'Prints all packages presented in monorepo')

export default pkgset
