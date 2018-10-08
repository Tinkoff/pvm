import { wdShell } from '../shell'
import type { DiffStats, NamedDiff } from '../../types/git'

export interface NamedDiffShellOpts {
  cwd: string,
}

function namedDiff(revArgs: string, shellOpts: NamedDiffShellOpts): NamedDiff {
  const nameStats = wdShell(shellOpts.cwd, `git diff --name-status ${revArgs}`).split('\n')
  const result = Object.create(null)

  for (const line of nameStats) {
    if (!line.trim()) {
      continue
    }

    const [action, filepath, newPath] = line.split(/\s+/)

    const resultPath = newPath || filepath
    const stats: DiffStats = {
      action: action.charAt(0) as DiffStats['action'],
    }
    if (newPath) {
      stats.oldPath = filepath
    }

    if (stats.action === 'R' || stats.action === 'C') {
      stats.actionScore = Number(action.slice(1))
    }
    result[resultPath] = stats
  }

  return result
}

export default namedDiff
