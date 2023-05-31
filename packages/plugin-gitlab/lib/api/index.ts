import type { Container, HttpReqOptions, HttpResponseSuccess } from '@pvm/pvm'
import { requestWithRetries, httpreq, shell, env, CONFIG_TOKEN } from '@pvm/pvm'

import { getApiUrl } from '../remote-url'
import { GITLAB_AUTH_FUNCTION_TOKEN } from '../../tokens'

const retryTimeouts = [
  5000, 15000, 60000, 200000, 300000,
]

async function glapi<T = any>(di: Container, uri: string, opts: HttpReqOptions = {}): Promise<HttpResponseSuccess<T>> {
  const {
    GL_TOKEN,
    GITLAB_TOKEN,
    GITLAB_AUTH_COMMAND,
  } = env

  const gitlabAuthFn = di.get({ token: GITLAB_AUTH_FUNCTION_TOKEN, optional: true })
  const config = di.get(CONFIG_TOKEN)

  let privateToken = GL_TOKEN || GITLAB_TOKEN
  if (!privateToken) {
    if (GITLAB_AUTH_COMMAND) {
      privateToken = shell(GITLAB_AUTH_COMMAND)
      if (!privateToken) {
        throw new Error(`Command "${GITLAB_AUTH_COMMAND}" doesn't return access token for gitlab`)
      }
    } else if (gitlabAuthFn) {
      privateToken = await gitlabAuthFn()
      if (!privateToken) {
        throw new Error(`Provided plugin for "gitlab.auth_token_fn" does not return valid token`)
      }
    } else {
      throw new Error(
        `Unable to resolve authorization token for gitlab. It could be GL_TOKEN or GITLAB_TOKEN or GITLAB_AUTH_COMMAND env variable or pvm provider/plugin`
      )
    }
  }
  const { headers = {} } = opts

  const authHeaders: Record<string, string> = {}
  if (config.gitlab.authorization_type === 'private-token') {
    authHeaders['Private-Token'] = privateToken
  } else if (config.gitlab.authorization_type === 'bearer') {
    authHeaders['Authorization'] = `Bearer ${privateToken}`
  }

  return await requestWithRetries(() => httpreq<T>(`${getApiUrl(config)}${config.gitlab.api_prefix}${uri}`, {
    ...opts,
    headers: {
      ...headers,
      ...authHeaders,
    },
  }), { timeouts: retryTimeouts, retryCodes: [429] })
}

export {
  glapi,
}

export default glapi
