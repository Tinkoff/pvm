import { logger } from '../../../lib/logger'
import { Repository } from '../../repository'
import { lint } from '../../repository/linter'
/* import { upconf } from '@pvm/repository/lib/upconf/upconf' */
import { getConfig } from '../../../lib/config'

import type { Config } from '../../../types'
/* import type { Vcs } from '@pvm/vcs' */

async function autolint(config: Config) {
  logger.info('update.autolint is enabled, linting and fix if necessary packages before update..')
  const repo = new Repository(config.cwd, config)
  const lintResult = lint(repo, {
    fix: true,
    index: true,
  })
  if (lintResult.errors.length) {
    lintResult.errors.forEach(error => {
      logger.error(error)
    })
    throw new Error(`PVM lint has failed.`)
  }
}

async function prepare(config: Config/*, vcs: Vcs */) {
  // await upconf(vcs)
  // after upconf we should refetch config
  config = await getConfig(config.cwd)
  if (config.update.autolint) {
    await autolint(config)
  }
}

export {
  autolint,
  prepare,
}
