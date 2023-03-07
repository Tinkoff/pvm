import semver from 'semver'
import { PkgSet } from '../../../lib/pkg-set'
import type { UpdateState } from '../update-state'

interface AnalyzeResult {
  warnings: string[],
}

export function analyzeUpdate(updateState: UpdateState): AnalyzeResult {
  const warnings: string[] = []
  const packagesByName = new PkgSet(updateState.getReleasePackages().values())

  for (const newPkg of updateState.getReleasePackages().values()) {
    const newPkgDeps = newPkg.allOwnDeps

    for (const dep of Object.keys(newPkgDeps)) {
      if (!packagesByName.has(dep)) {
        continue
      }
      const depPkg = packagesByName.get(dep)!
      const depMatch = newPkgDeps[dep]

      if (updateState.repo.config.versioning.source === 'package') {
        if (!semver.satisfies(depPkg.version, depMatch)) {
          warnings.push(
            `Dependency ${dep}@${depMatch} of ${newPkg.name} package is out of sync with workspace! New version of dependency will be ${depPkg.version}`
          )
        }
      } else {
        if (!semver.satisfies(depPkg.meta.version, depMatch)) {
          warnings.push(
            `Dependency ${dep}@${depMatch} of ${newPkg.name} package is out of sync with workspace! Current package.json's version of ${depPkg.name} is ${depPkg.meta.version}`
          )
        }
      }
    }
  }

  return {
    warnings,
  }
}

export async function run(updateState: UpdateState): Promise<string | void> {
  const { warnings } = analyzeUpdate(updateState)

  if (warnings.length) {
    return warnings.join('\n')
  }
}
