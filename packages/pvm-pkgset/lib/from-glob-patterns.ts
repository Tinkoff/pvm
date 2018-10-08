import micromatch from 'micromatch'
import { getWorkspacesSync, getWorkspacesFromRef } from '@pvm/core/lib/workspaces'
import type { Pkg } from '@pvm/core/lib/pkg'
import { loadPkg } from '@pvm/core/lib/pkg'
import type { Config } from '@pvm/core/lib/config'

function * fromGlobPatterns(config: Config, patterns: string[], ref: string | undefined): IterableIterator<Pkg> {
  const { cwd } = config
  const workspaces = ref ? getWorkspacesFromRef(ref, cwd) : getWorkspacesSync(cwd)

  for (const pkgPath of workspaces) {
    if (micromatch.isMatch(pkgPath, patterns, { cwd })) {
      yield loadPkg(config, pkgPath, { ref })!
    }
  }
}

export default fromGlobPatterns
