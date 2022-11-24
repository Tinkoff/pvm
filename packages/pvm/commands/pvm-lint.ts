#!/usr/bin/env node
import { Repository } from '../mechanics/repository'
import { logger } from '../lib/logger'
import { lint } from '../mechanics/repository/linter'
import type { Container } from '@tinkoff/dippy'

export default (di: Container) => ({
  command: 'lint',
  description: 'Checks that package versions correspond to the selected settings and policies in the project.',
  builder: {
    fix: {
      default: false,
      desc: 'Automatically fix found bugs or versions if possible',
    },
  },

  handler: async (flags) => {
    const repo = await Repository.init(di)
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
  },
})
