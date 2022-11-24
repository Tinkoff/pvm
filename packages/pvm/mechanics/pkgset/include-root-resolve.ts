import type { IncludeRootOption } from './types'
import { loadPkg } from '../../lib/pkg'
import type { Config } from '../../types'
import { logger } from '../../lib/logger'
import chalk from 'chalk'

function includeRootResolve(includeRoot: IncludeRootOption, config: Config, ref?: string): boolean {
  let include = includeRoot

  if (include === 'auto') {
    const rootPkg = loadPkg(config, '.', { ref })

    include = rootPkg ? !!rootPkg.meta.version : false

    if (!include) {
      logger.debug(chalk`{yellow Root pkg is not included because of missing "version" field in package.json}`)
    }
  }

  return include
}

export default includeRootResolve
