import { matchAny } from '@pvm/core/lib/pkg-match'
import { PkgSet } from '@pvm/core/lib/pkg-set'
import type { Config } from '@pvm/core/lib/config/types'
import type { Pkg } from '@pvm/core/lib/pkg'

export interface UnifiedGroups {
  mainUnifiedGroup: PkgSet,
  independentGroup: PkgSet,
  unifiedList: Array<PkgSet>,
}

// also see logic in isPkgFromMainUnifiedGroup function
export function getUnifiedGroups(config: Config, packagesPool: Iterable<Pkg>): UnifiedGroups {
  const { unified_versions_for = [], unified, independent_packages } = config.versioning

  let restPackages = Array.from(packagesPool)

  const ejectPackagesByPatterns = (patterns: string[]): PkgSet => {
    const newRestPackages: Pkg[] = []
    const ejectedPackages = new PkgSet()
    for (const pkg of restPackages) {
      if (matchAny(pkg, patterns)) {
        ejectedPackages.add(pkg)
      } else {
        newRestPackages.push(pkg)
      }
    }
    restPackages = newRestPackages
    return ejectedPackages
  }

  let mainUnifiedGroup: PkgSet = new PkgSet()
  const independentGroup = independent_packages.length ? ejectPackagesByPatterns(independent_packages) : new PkgSet()

  const unifiedList: PkgSet[] = []

  for (const scopePatternValue of unified_versions_for) {
    const scopePatterns: string[] = typeof scopePatternValue === 'string' ? [scopePatternValue] : scopePatternValue

    const ejectedPackages = ejectPackagesByPatterns(scopePatterns)
    if (ejectedPackages.size > 0) {
      unifiedList.push(ejectedPackages)
    }
  }

  if (unified) {
    const unifiedPackagesList = !Array.isArray(unified) ? restPackages : restPackages.filter(pkg => matchAny(pkg, unified))
    mainUnifiedGroup = new PkgSet(unifiedPackagesList)
    unifiedList.unshift(mainUnifiedGroup)
    restPackages = []
  }

  return {
    mainUnifiedGroup,
    unifiedList,
    independentGroup,
  }
}
