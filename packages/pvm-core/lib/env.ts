import Ajv from 'ajv'
import chalk from 'chalk'
import EnvJsonSchema from '../env-schema.json'

import type { ValidateFunction } from 'ajv'
import type { Env } from '../env-schema'
import { envDefaults } from '../env-defaults'

let envsCache: Env
let compiledSchema: ValidateFunction

type EnvCheck = keyof Env | { oneOf: Array<keyof Env> }
export function checkEnv(checks: EnvCheck | Array<EnvCheck>, action: string, { logger, silent } = { logger: { info: console.info }, silent: true }): boolean {
  const env = getEnv()

  let result = true;

  (Array.isArray(checks) ? checks : [checks]).forEach((check) => {
    const oneOf = typeof check === 'string' ? [check] : check.oneOf

    const found = oneOf.some(envName => typeof env[envName] !== 'undefined')

    result = result && found

    if (!found) {
      const message = `env variable ${oneOf.join(' or ')} is required for ${action}`
      if (silent) {
        logger.info(message)
      } else {
        throw new Error(message)
      }
    }
  })

  return result
}

export function getEnv(): Env {
  if (envsCache) {
    return envsCache
  }

  // eslint-disable-next-line pvm/no-process-env
  const envs = process.env

  for (const [name, env] of Object.entries(envDefaults)) {
    if (envs[name] === undefined) {
      envs[name] = env
    }
  }

  if (!compiledSchema) {
    const ajv = new Ajv()
    compiledSchema = ajv.compile(EnvJsonSchema)
  }

  if (!compiledSchema(envs)) {
    const formattedError = compiledSchema.errors?.reduce((acc, err) => {
      return acc.concat(chalk`{blue env${err.dataPath}} has incorrect value "{yellow ${envs[err.dataPath.replace(/^\./, '')]}}", according to schema. See error message below
${err.message} (${JSON.stringify(err.params)})`)
    }, [] as string[]) ?? ['no additional info']
    throw new Error(`Invalid environment variables:\n${formattedError.join('\n')}`)
  }

  envsCache = envs as Env

  return envsCache
}

export const env = getEnv()
