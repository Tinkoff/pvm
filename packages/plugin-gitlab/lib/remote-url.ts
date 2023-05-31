import type { Config } from '@pvm/pvm'
import { getHostUrl, env } from '@pvm/pvm'

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
