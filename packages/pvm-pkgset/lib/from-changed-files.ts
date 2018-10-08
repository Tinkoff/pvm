import type { IncludeRootOption } from '../types'
import filterPackages from './filter-packages'
import includeRootResolve from './include-root-resolve'
import type { Pkg } from '@pvm/core/lib/pkg'
import { loadPkg } from '@pvm/core/lib/pkg'
import { getWorkspacesFromRef, getWorkspacesSync } from '@pvm/core/lib/workspaces'
import type { ChangedFiles } from './changed-files'
import type { Config } from '@pvm/core/lib/config/types'

export interface FromChangedFilesOpts {
  includeRoot?: IncludeRootOption,
}

export function * pkgsetFromChangedFiles(config: Config, changed: ChangedFiles, opts: FromChangedFilesOpts = {}): IterableIterator<Pkg> {
  const {
    includeRoot = 'auto',
  } = opts

  const {
    files,
    targetLoadRef,
  } = changed

  const workspaces = !targetLoadRef ? getWorkspacesSync(config.cwd) : getWorkspacesFromRef(targetLoadRef, config.cwd)

  const filteredPkgPaths = filterPackages(config, workspaces, files, includeRootResolve(includeRoot, config, targetLoadRef))
  for (const pkgPath of filteredPkgPaths) {
    const pkg = loadPkg(config, pkgPath, { cwd: config.cwd, ref: targetLoadRef })
    if (!pkg) {
      throw new Error(`Failed load package from ${pkgPath} from ${targetLoadRef || 'working dir'}`)
    }
    yield pkg
  }
}
