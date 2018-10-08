import { error, logger } from './logger'
import shell from './shell'
import { env } from './env'
import { gitFetch } from './git/commands'

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { version } = require('../package.json')

const fail = (e) => {
  logger.fatal(e)
  process.exitCode = 1
}

nodeBoot()

function beforeExitCallback(): void {
  if (typeof process.exitCode === 'undefined') {
    logger.fatal('Deadlock detected!')
    process.exitCode = 1
  }
}

function nodeBoot(): void {
  process.on('beforeExit', beforeExitCallback)
  process.on('uncaughtException', fail)
  process.on('unhandledRejection', fail)

  logger.info(`running pvm version ${version}`)
  const cwd = process.cwd()

  const isCi = !!env.CI

  // !env.PVM_TESTING_ENV т.к. в тестах origin'ом является сама папка пакета и если зафетчить, то
  // origin/master и HEAD будут одним и тем же коммитом, что сломает pkgset -> changed files и affected
  if (isCi && !env.PVM_NO_GIT_FETCH && !env.PVM_TESTING_ENV) {
    logger.info('do git fetch..')
    try {
      gitFetch(cwd)
    } catch (e) {
      error(e)
    }
  }

  // workaround for gitlab runner issue
  if (isCi) {
    try {
      shell('git rev-parse origin/master', { cwd })
    } catch (e) {
      gitFetch(cwd)
    }
  }
}
