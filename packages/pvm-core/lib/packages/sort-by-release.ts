import { cmpReleaseTypes } from '../semver-extra'

import type { SemverReleaseType } from '@pvm/types'
import type { Pkg } from '../pkg'

function sortByRelease(packages: Iterable<Pkg>, resolveReleaseTypeFor: (p: Pkg) => SemverReleaseType | null): Pkg[] {
  return [...packages].sort((a: Pkg, b: Pkg) => {
    const aDiff: SemverReleaseType | null = resolveReleaseTypeFor(a)
    const bDiff: SemverReleaseType | null = resolveReleaseTypeFor(b)

    return cmpReleaseTypes(aDiff, bDiff)
  })
}

export default sortByRelease
