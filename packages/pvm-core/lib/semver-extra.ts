import semver from 'semver'
import type { PvmReleaseType } from '@pvm/types'

export const releaseTypesInAscendingOrder: PvmReleaseType[] =
  ['none', 'prerelease', 'prepatch', 'patch', 'preminor', 'minor', 'premajor', 'major']

export function isValidReleaseType(releaseType: string | void): boolean {
  if (releaseType === 'none') {
    return true
  }
  try {
    // @ts-ignore
    return semver.inc('1.0.0', releaseType) !== null
  } catch (e) {
    return false
  }
}

// Return 0 if a == b, 1 if a is less, -1 if b is less. Sorts in descending order if passed to Array.sort().
export function cmpReleaseTypes(a: PvmReleaseType | null, b: PvmReleaseType | null): -1 | 0 | 1 {
  const aIndex = a === null ? -1 : releaseTypesInAscendingOrder.indexOf(a)
  const bIndex = b === null ? -1 : releaseTypesInAscendingOrder.indexOf(b)

  if (aIndex < bIndex) {
    return 1
  } else if (aIndex > bIndex) {
    return -1
  }
  return 0
}

export const releaseTypes = {
  gt(a: PvmReleaseType, b: PvmReleaseType): boolean {
    return cmpReleaseTypes(a, b) === -1
  },
  gte(a: PvmReleaseType, b: PvmReleaseType): boolean {
    const cmp = cmpReleaseTypes(a, b)
    return cmp === -1 || cmp === 0
  },
  lt(a: PvmReleaseType, b: PvmReleaseType): boolean {
    const cmp = cmpReleaseTypes(a, b)
    return cmp === 1
  },
  lte(a: PvmReleaseType, b: PvmReleaseType): boolean {
    const cmp = cmpReleaseTypes(a, b)
    return cmp === 1 || cmp === 0
  },
  eq(a: PvmReleaseType, b: PvmReleaseType): boolean {
    return a === b
  },
  max<T extends readonly PvmReleaseType[]>(...args: T): T extends [] ? undefined : PvmReleaseType {
    const indexes = args.map(releaseType => releaseTypesInAscendingOrder.indexOf(releaseType))
    let maxIndex = -Infinity
    let resultIndex = 0

    for (let i = 0; i < indexes.length; i++) {
      if (indexes[i] !== -1 && indexes[i] > maxIndex) {
        maxIndex = indexes[i]
        resultIndex = i
      }
    }

    return (args.length === 0 ? undefined : args[resultIndex]) as (T extends [] ? undefined : PvmReleaseType)
  },
}
