import type { Config } from '@pvm/core/lib/config'
import { getHostUrl } from '@pvm/core/lib/git/commands'
import { env } from '@pvm/core/lib/env'

export function getApiUrl(config: Config): string {
  if (config.gitlab.api_url) {
    return config.gitlab.api_url
  }
  return getGitlabHostUrl(config)
}

export function getGitlabHostUrl(config: Config): string {
  const { GITLAB_CI, CI_SERVER_HOST } = env

  if (config.gitlab.url) {
    return config.gitlab.url
  }
  if (GITLAB_CI) {
    return `https://${CI_SERVER_HOST}`
  }

  const hostUrl = getHostUrl(config.cwd)
  if (hostUrl) {
    return hostUrl
  }

  return config.gitlab.default_url
}

if (require.main === module) {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { getConfig } = require('@pvm/core/lib/config')

  getConfig().then(config => {
    console.log(getGitlabHostUrl(config))
  })
}
