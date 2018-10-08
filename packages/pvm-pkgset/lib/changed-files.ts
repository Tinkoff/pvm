import { wdShell } from '@pvm/core/lib/shell'
import namedDiff from '@pvm/core/lib/git/named-diff'
import type { DiffStats } from '@pvm/core/types/git'
import { mergeBase } from '@pvm/core/lib/git/merge-base'

export interface ChangedFilesOpts {
  from?: string,
  to?: string,
  cwd?: string,
  includeUncommited?: boolean,
}

function untrackedFiles(cwd: string): DiffStats {
  const result = Object.create(null)
  const files = wdShell(cwd, 'git ls-files --others --exclude-standard')

  for (const line of files.split('\n')) {
    if (!line.trim()) {
      continue
    }

    result[line] = {
      action: 'A',
    }
  }

  return result
}

export interface ChangedFiles {
  files: string[],
  fromRef: string,
  targetRef: string,
  targetLoadRef: string | undefined,
  cwd: string,
  includeUncommited: boolean,
}

function changedFiles(opts: ChangedFilesOpts = {}): ChangedFiles {
  const {
    from = 'origin/master',
    to = 'HEAD',
    cwd = process.cwd(),
    includeUncommited = false,
  } = opts

  const mergeBaseRev = mergeBase(cwd, from, to)
  const fileDiff = namedDiff(`${mergeBaseRev} ${to}`, { cwd })
  if (includeUncommited) {
    // 1. include not-commited changed
    Object.assign(fileDiff, namedDiff(`HEAD`, { cwd }))
    // 2. also include untracked files
    Object.assign(fileDiff, untrackedFiles(cwd))
  }
  return {
    includeUncommited,
    files: Object.keys(fileDiff).sort(),
    fromRef: mergeBaseRev,
    targetRef: to,
    targetLoadRef: to.toUpperCase() === 'HEAD' && includeUncommited ? void 0 : to,
    cwd,
  }
}

export {
  changedFiles,
}
