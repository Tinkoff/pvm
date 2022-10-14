#!/usr/bin/env node
import { Repository } from '@pvm/repository/lib'
import { logger } from '@pvm/core/lib/logger'
import { lint } from '@pvm/repository/lib/linter'

export const command = 'lint'
export const description = 'Checks that package versions correspond to the selected settings and policies in the project.'
export const builder = {
  fix: {
    default: false,
    desc: 'Automatically fix found bugs or versions if possible',
  },
}

export const handler = async (flags) => {
  const repo = await Repository.init(process.cwd())
  const lintResult = lint(repo, {
    fix: flags.fix,
  })

  if (!lintResult.errors.length) {
    logger.info('all checks passed')
  } else {
    lintResult.errors.forEach(error => {
      logger.error(error)
    })
    process.exitCode = 1
  }
}
