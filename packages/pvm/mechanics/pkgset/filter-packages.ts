import type { Config } from '../../types'
import binarySearch from './utils/binary-search'
import { exclude } from './smart-paths'
import isRootChanged from './is-root-changed'

function * filterPackages(config: Config, workspaces: string[], changedFiles: string[], includeRoot = false): IterableIterator<string> {
  workspaces = workspaces.sort()
  changedFiles = changedFiles.sort()
  const hintsFile = config.update.hints_file
  const ignoredPatterns = new Set<string>(config.pkgset.ignore_files)
  if (hintsFile) {
    ignoredPatterns.add(`/${hintsFile}`)
  }

  changedFiles = exclude(workspaces, changedFiles, Array.from(ignoredPatterns.values()))

  let seenRootPkg = false

  for (const pkgPath of workspaces) {
    if (pkgPath === '.') {
      seenRootPkg = true
    }
    const needInclude = pkgPath === '.' ||
      binarySearch(changedFiles, p => `${p}/`.startsWith(`${pkgPath}/`), p => `${pkgPath}/` > p) !== -1

    if (needInclude) {
      yield pkgPath
    }
  }

  if (!seenRootPkg && includeRoot && isRootChanged(workspaces, changedFiles)) {
    yield '.'
  }
}

export default filterPackages
