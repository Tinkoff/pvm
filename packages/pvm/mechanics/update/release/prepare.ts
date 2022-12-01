import { logger } from '../../../lib/logger'
import { lint } from '../../repository/linter'
/* import { upconf } from '@pvm/repository/lib/upconf/upconf' */

import type { Container } from '../../../lib/di'
import { CONFIG_TOKEN, REPOSITORY_FACTORY_TOKEN } from '../../../tokens'
/* import type { Vcs } from '@pvm/vcs' */

async function autolint(di: Container) {
  logger.info('update.autolint is enabled, linting and fix if necessary packages before update..')
  const repo = di.get(REPOSITORY_FACTORY_TOKEN)()
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

async function prepare(di: Container/*, vcs: Vcs */) {
  // await upconf(vcs)
  // after upconf we should refetch config
  const config = di.get(CONFIG_TOKEN)
  if (config.update.autolint) {
    await autolint(di)
  }
}

export {
  autolint,
  prepare,
}
