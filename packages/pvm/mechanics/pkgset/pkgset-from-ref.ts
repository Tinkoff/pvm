import { pkgsetAll } from './pkgset-all'

import type { IncludeRootOption } from './types'
import type { Pkg } from '../../lib/pkg'
import type { Config } from '../../types'

export interface PkgsetFromRefOpts {
  includeRoot?: IncludeRootOption,
}

export function * pkgsetFromRef(config: Config, ref: string, opts: PkgsetFromRefOpts = {}): IterableIterator<Pkg> {
  yield * pkgsetAll(config, {
    ...opts,
    ref,
  })
}
