import { getWorkspacesSync, getWorkspacesFromRef } from '@pvm/core/lib/workspaces'
import type { Pkg } from '@pvm/core/lib/pkg'
import { loadPkg } from '@pvm/core/lib/pkg'
import type { IncludeRootOption } from '../types'
import includeRootResolve from './include-root-resolve'
import type { Config } from '@pvm/core/lib/config'

export interface PkgsetAllOpts {
  includeRoot?: IncludeRootOption,
  ref?: string,
}

export function * pkgsetAll(config: Config, opts: PkgsetAllOpts = {}): IterableIterator<Pkg> {
  const { includeRoot = 'auto', ref } = opts
  const pkgPaths = ref ? getWorkspacesFromRef(ref, config.cwd) : getWorkspacesSync(config.cwd)

  for (const pkgPath of pkgPaths) {
    const pkg = loadPkg(config, pkgPath, { ref })
    if (pkg) {
      yield pkg
    }
  }

  if (includeRootResolve(includeRoot, config, ref)) {
    const rootPkg = loadPkg(config, '.', { ref })
    // емиттим только если монорепа, иначе емит рутового пакета уже был выше
    if (rootPkg?.meta.private) {
      yield rootPkg
    }
  }
}
