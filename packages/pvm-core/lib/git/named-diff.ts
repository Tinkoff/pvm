import { wdShell } from '../shell'
import type { DiffStats, NamedDiff } from '@pvm/types'
import { gitToCwdRelativity } from './worktree'

export interface NamedDiffShellOpts {
  cwd: string,
}

function namedDiff(revArgs: string, shellOpts: NamedDiffShellOpts): NamedDiff {
  const nameStats = wdShell(shellOpts.cwd, `git diff --name-status ${revArgs}`, {
    maxBuffer: 1024 * 1024 * 10,
  }).split('\n')
  const result = Object.create(null)

  for (const line of nameStats) {
    if (!line.trim()) {
      continue
    }

    const [action, filepath, newPath] = line.split(/\s+/)

    const resultPath = gitToCwdRelativity(shellOpts.cwd, newPath || filepath)
    const stats: DiffStats = {
      action: action.charAt(0) as DiffStats['action'],
    }
    if (newPath) {
      stats.oldPath = gitToCwdRelativity(shellOpts.cwd, filepath)
    }

    if (stats.action === 'R' || stats.action === 'C') {
      stats.actionScore = Number(action.slice(1))
    }
    result[resultPath] = stats
  }

  return result
}

export default namedDiff
