import type { PkgsetChangedOpts } from './changed'
import changed from './changed'
import type { Pkg } from '../../../lib/pkg'
import type { Container } from '../../../lib/di'

type PkgsetChangedAtOpts = PkgsetChangedOpts & Partial<{
  ref: string,
}>

function pkgset(di: Container, opts: PkgsetChangedAtOpts = {}): AsyncIterableIterator<Pkg> {
  const { ref = 'HEAD' } = opts

  return changed(di, {
    ...opts,
    from: `${ref}^`,
    to: ref,
  })
}

export default pkgset
