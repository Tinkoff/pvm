import { shell } from '../index'
import { logger } from '../logger'
import path from 'path'
import { mema } from '../memoize'

/**
 * Для загрузки конфигов и плагинов нужно уметь искать исходное рабочее дерево т.к.
 * в текущем может не быть нужных конфигурационных файлов и node_modules
 */
export function getMainWorktreePath(dir: string): string {
  logger.silly(`Looking for main worktree in ${dir}`)

  const worktreeList = shell('git worktree list --porcelain', {
    cwd: dir,
  })
  logger.silly(`Found following trees:\n${worktreeList}`)

  const mainWorktreePath = worktreeList.split('\n')[0].split(' ')[1] || dir
  logger.debug(`Main worktree location is: ${mainWorktreePath}`)

  return mainWorktreePath
}

/**
 * Для загрузки конфигов и плагинов нужно уметь искать исходное рабочее дерево т.к.
 * в текущем может не быть нужных конфигурационных файлов и node_modules
 */
export const getWorktreeRoot = mema(function getPureWorktreeRoot(cwd: string): string {
  logger.silly(`Looking for git root in ${cwd}`)

  const gitRoot = shell('git rev-parse --show-toplevel', {
    cwd: cwd,
  })

  return gitRoot
})

export function cwdToGitRelativity(cwd: string, p: string, getWorktreeRootCustom = getWorktreeRoot): string {
  const normalCwd = cwd.replace(/\\/g, '/')
  const worktreeRoot = getWorktreeRootCustom(normalCwd)

  if (worktreeRoot === normalCwd) {
    return p
  }

  const res = path.relative(worktreeRoot, path.join(normalCwd, p)).replace(/\\/g, '/')

  return res === '' && p === '.' ? '.' : res
}

export function gitToCwdRelativity(cwd: string, p: string, getWorktreeRootCustom = getWorktreeRoot): string {
  const normalCwd = cwd.replace(/\\/g, '/')
  const worktreeRoot = getWorktreeRootCustom(cwd)

  if (worktreeRoot === normalCwd) {
    return p
  }

  return path.relative(normalCwd, path.join(worktreeRoot, p))
}
