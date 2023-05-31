import parsePath from 'parse-path'
import { cwdShell, shell, getCurrentBranchIgnoreEnv, env } from '@pvm/pvm'

import type { Config } from '@pvm/pvm'

function resolveProjectId(cwd = process.cwd()): string {
  if (env.CI_PROJECT_ID) {
    return env.CI_PROJECT_ID
  }

  // todo: Это нужно переработать т.к. path не является заменой projectId
  return resolveProjectPath(cwd)
}

function resolveProjectPath(cwd = process.cwd()): string {
  if (env.CI_PROJECT_PATH) {
    return env.CI_PROJECT_PATH
  }

  const originUrl = shell('git remote get-url origin', { cwd })
  if (originUrl) {
    const { pathname } = parsePath(originUrl)
    return pathname
      .replace(/^\/+/, '')
      .replace(/\.git$/, '')
  }
  throw new Error(`Couldn't resolve gitlab project pathname for ${cwd}`)
}

const gitlabEnv = {
  get projectId(): string {
    return resolveProjectId()
  },

  get commitSha(): string {
    const { CI_COMMIT_SHA = cwdShell('git rev-parse HEAD') } = env

    return CI_COMMIT_SHA
  },

  get projectSlug(): string {
    return encodeURIComponent(this.projectId)
  },

  getBranchName(cwd = process.cwd()): string | undefined {
    if (env.GITLAB_CI && !env.PVM_TESTING_ENV) {
      return env.CI_COMMIT_REF_NAME
    }
    return getCurrentBranchIgnoreEnv(cwd)
  },

  getProjectUrl(config: Config): string {
    if (env.CI_PROJECT_URL) {
      return env.CI_PROJECT_URL
    }

    return `${config.gitlab.url}/${resolveProjectPath()}`
  },
}

export default gitlabEnv
