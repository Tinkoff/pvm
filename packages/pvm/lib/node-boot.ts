import { logger } from './logger'
import { shell } from './shell'
import { env } from './env'
import { gitFetch } from './git/commands'
import path from 'path'
import fs from 'fs'
// @ts-ignore
import ini from 'ini'

function readNpmRc(cwd: string): string {
  const npmrcPath = path.join(cwd, '.npmrc')
  return fs.existsSync(npmrcPath) ? fs.readFileSync(npmrcPath).toString('utf8') : ''
}

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { version } = require('../package.json')

let booted = false

const fail = (e: Error) => {
  logger.fatal(e)
  process.exitCode = 1
}

nodeBoot()

function beforeExitCallback(exitCode: number): void {
  if (typeof exitCode === 'undefined') {
    logger.fatal('Deadlock detected!')
    process.exitCode = 1
  }
}

function nodeBoot(): void {
  if (booted) {
    return
  }
  booted = true

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
      logger.error(e)
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

  const npmRc = readNpmRc(cwd)
  // eslint-disable-next-line pvm/no-process-env
  const classicYarn = process.env.npm_config_user_agent ? process.env.npm_config_user_agent.indexOf('yarn/1') !== -1 : false
  // yarn 1 overrides npmrc settings with its own set of npm config envs so `yarn publish-command` wont work if it depends on those
  // strict-ssl is one of those important settings, so copy it to envs and override yarn default one
  if (classicYarn && npmRc) {
    if (npmRc.indexOf('strict-ssl') !== -1) {
      const parsedNpmRc = ini.parse(npmRc)
      if (parsedNpmRc['strict-ssl'] !== undefined) {
        // eslint-disable-next-line pvm/no-process-env
        process.env.npm_config_strict_ssl = parsedNpmRc['strict-ssl']
      }
    }
  }
}
