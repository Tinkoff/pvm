import { Repository } from '../mechanics/repository'
import { logger } from '../lib/logger'
import { lint } from '../mechanics/repository/linter'
import type { Container } from '../lib/di'
import type { CommandFactory } from '../types/cli'

export default (di: Container): CommandFactory => builder => builder.command(
  'lint',
  'Checks that package versions correspond to the selected settings and policies in the project.',
  {
    fix: {
      default: false,
      desc: 'Automatically fix found bugs or versions if possible',
    },
  },
  async (flags) => {
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
  }
)
