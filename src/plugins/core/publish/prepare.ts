import fs from 'fs'
import util from 'util'
import path from 'path'
import { URL } from 'url'

import semver from 'semver'

import { getConfig } from '@pvm/core/lib/config'
import { getNpmVersion } from '@pvm/core/lib/runtime-env/versions'
import shell from '@pvm/core/lib/shell'
import { logger as defaultLogger } from '@pvm/core/lib/logger'
import type { LoggerFunc } from '@pvm/core/lib/logger'
import { env } from '@pvm/core/lib/env'
import ini from 'ini'

interface LoggerLike {
  log: LoggerFunc,
  debug: LoggerFunc,
  info: LoggerFunc,
  warn: LoggerFunc,
  error: LoggerFunc,
}

interface PrepareOpts {
  logger?: LoggerLike,
  baseRegistry?: string,
  dontWriteNpmRc?: boolean,
}

const writeFile = util.promisify(fs.writeFile)

export function isProbablyBasicAuthToken(token: string): boolean {
  const decoded = Buffer.from(token, 'base64').toString('utf8')
  return /^[\w\d]+:[\w\d\s!@#$%^&*()[\]\-=+{}:;'"\\|/?<>.,~`±§]+$/i.test(decoded)
}

export function readNpmRc(cwd: string): string {
  const npmrcPath = path.join(cwd, '.npmrc')
  return fs.existsSync(npmrcPath) ? fs.readFileSync(npmrcPath).toString('utf8') : ''
}

export interface PublishPrepareResult {
  publishEnv: Record<string, string | undefined>,
  npmrc: string[],
}

export async function setupPublishNpmRCAndEnvVariables(cwd: string, opts: PrepareOpts = {}): Promise<PublishPrepareResult> {
  const {
    baseRegistry = 'https://registry.npmjs.org',
    logger = defaultLogger,
    dontWriteNpmRc = false,
  } = opts
  const config = await getConfig(cwd)

  const npmVersion = getNpmVersion() || '0.0.0'
  logger.log(`npm version is ${npmVersion}`)
  // all what I know - 6.7.0 works without email, but 6.4.1 isn't,
  // probably some versions prior to 6.7.0 works too
  const isNpmVersionWhichNeedEmailForPublishing = semver.lt(npmVersion, '6.7.0')
  if (isNpmVersionWhichNeedEmailForPublishing) {
    logger.warn('You are using outdated npm version, consider update npm and node')
  }

  const publishEnv = {
    ...process.env,
  }
  const npmrcContents: string[] = []

  const { NPM_TOKEN } = env
  const npmRc = readNpmRc(cwd)
  if (config.publish.process_npm_token && NPM_TOKEN) {
    // for backward compatibility
    if (isProbablyBasicAuthToken(NPM_TOKEN)) {
      logger.warn(
        `Looks like you have basic auth token configured via "NPM_TOKEN" env variable which is deprecated, use npm_config__auth env variable instead`
      )
      logger.warn('Re-exporting NPM_TOKEN as npm_config__auth env variable for "npm publish" process.')

      publishEnv.npm_config__auth = NPM_TOKEN

      // запись в env будет работать, но только в версии 6.4.0 и выше, см. https://github.com/npm/cli/releases/tag/v6.4.0 и https://github.com/npm/npm/issues/15565
      // поэтому запишем еще в .npmrc
      if (semver.lt(npmVersion, '6.4.0')) {
        logger.warn(
          `Appending auth variable to .npmrc due to your npm version has issue https://github.com/npm/npm/issues/15565 which was solved in npm v6.4.0`
        )
        npmrcContents.push(`_auth=${NPM_TOKEN}`)
      }
    } else {
      const registryUrl = new URL(baseRegistry)
      const registryWithoutProtocol = registryUrl.href.substr(registryUrl.protocol.length)
      // see https://docs.npmjs.com/using-private-packages-in-a-ci-cd-workflow
      const authTokenLine = `${registryWithoutProtocol}:_authToken=${NPM_TOKEN}`
      const authTokenLineGeneral = `${registryWithoutProtocol}:_authToken=\${NPM_TOKEN}`
      if (npmRc.indexOf(authTokenLine) === -1 && npmRc.indexOf(authTokenLineGeneral) === -1) {
        logger.info(`Configure authorization via authToken for ${registryWithoutProtocol} registry in .npmrc`)
        npmrcContents.push(authTokenLine)
      }
    }
  }

  if (isNpmVersionWhichNeedEmailForPublishing && shell('npm config get email', { cwd }) === 'undefined') {
    const email = config.publish.email || 'pvm@pvm.service'
    logger.log(`appending email ${email} to .npmrc due to your npm version requires email for publishing`)
    npmrcContents.push(`email=${email}`)
  }

  // eslint-disable-next-line pvm/no-process-env
  const classicYarn = process.env.npm_config_user_agent ? process.env.npm_config_user_agent.indexOf('yarn/1') !== -1 : false
  // yarn 1 overrides npmrc settings with its own set of npm config envs so `yarn publish-command` wont work if it depends on those
  // strict-ssl is one of those important settings, so copy it to envs and override yarn default one
  if (classicYarn && npmRc) {
    if (npmRc.indexOf('strict-ssl') !== -1) {
      const parsedNpmRc = ini.parse(npmRc)
      if (parsedNpmRc['strict-ssl'] !== undefined) {
        publishEnv.npm_config_strict_ssl = parsedNpmRc['strict-ssl']
      }
    }
  }

  if (!dontWriteNpmRc && npmrcContents.length) {
    await writeFile(path.join(cwd, '.npmrc'), `\n${npmrcContents.join('\n')}\n`, {
      flag: 'a',
    })
  }

  return {
    publishEnv,
    npmrc: npmrcContents,
  }
}
