import { shell } from '../index'
import { logger } from '../logger'

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
