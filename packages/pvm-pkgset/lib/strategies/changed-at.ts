import type { PkgsetChangedOpts } from './changed'
import changed from './changed'
import type { Pkg } from '@pvm/core/lib/pkg'

type PkgsetChangedAtOpts = PkgsetChangedOpts & Partial<{
  ref: string,
}>

function pkgset(opts: PkgsetChangedAtOpts = {}): AsyncIterableIterator<Pkg> {
  const { ref = 'HEAD' } = opts

  return changed({
    ...opts,
    from: `${ref}^`,
    to: ref,
  })
}

export default pkgset
