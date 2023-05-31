import { Signales } from 'signales'
import type { LoggerFunction, DefaultLogLevels } from 'signales'
import { env } from './env'

export { LoggerFunction as LoggerFunc }

const { DEBUG = '', PVM_LL } = env

let logLevel = PVM_LL
if (!logLevel) {
  logLevel = /pvm/.test(DEBUG) ? 'debug' : 'info'
}

const secretKeys: Array<keyof typeof env> = ['GL_TOKEN', 'GITLAB_TOKEN', 'GITHUB_TOKEN', 'GITHUB_AUTH']

const secrets = secretKeys.reduce((acc, key) => {
  const secret = env[key]
  if (secret) {
    acc.push(secret)
  }
  return acc
}, [] as string[])

export const logger = new Signales({
  // stream: process.stderr,
  scope: 'pvm',
  logLevels: {
    silly: -1,
  },
  logLevel: logLevel as DefaultLogLevels | 'silly',
  secrets,
  types: {
    debug: {
      color: 'gray',
    },
    silly: {
      badge: '🔎',
      color: 'white',
      label: 'silly',
      logLevel: 'silly',
    },
    deprecate: {
      badge: '⚠️',
      color: 'magenta',
      label: 'DEPRECATED',
      logLevel: 'warn',
    },
  },
})
export const loggerFor = (scope: string) => logger.scope(scope)

export const log = logger.log.bind(logger)
