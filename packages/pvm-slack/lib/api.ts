import { loggerFor } from '@pvm/core/lib/logger'
import type { HttpResponseSuccess } from '@pvm/core/lib/httpreq'
import httpreq from '@pvm/core/lib/httpreq'
import resolveFrom from 'resolve-from'
import { requireDefault } from '@pvm/core/lib'

import type { Config } from '@pvm/core/lib/config'
import { env as defaultEnv } from '@pvm/core/lib/env'

const SLACK_API_URL = defaultEnv.SLACK_API_URL || 'https://slack.com/api'
const logger = loggerFor('pvm:slack')

export interface SlackMessage {
  username?: string,
  text?: string,
  blocks?: any[],
  attachments?: any[],
  icon_emoji?: string,
  icon_url?: string,
  channel?: string,
}

export interface SlackSendOpts {
  env?: Record<string, string>,
}

function getDefaultsParams(): Partial<SlackMessage> {
  const projectPkg = resolveFrom.silent(process.cwd(), './package')
  const username = projectPkg ? `${requireDefault(projectPkg).name} minion` : void 0

  return {
    username,
  }
}

// https://api.slack.com/custom-integrations/incoming-webhooks
// https://api.slack.com/messaging/webhooks
// !Warning:  new webhooks supports only text,blocks fields in SlackMessage
function webhookSend(message: SlackMessage, opts: SlackSendOpts = {}): Promise<HttpResponseSuccess<unknown>> {
  // eslint-disable-next-line pvm/no-process-env
  const { env = defaultEnv } = opts
  const SLACK_WEBHOOK = readPvmEnv('SLACK_WEBHOOK', env)
  const SLACK_WEBHOOK_URL = readPvmEnv('SLACK_WEBHOOK_URL', env)

  if (!SLACK_WEBHOOK && !SLACK_WEBHOOK_URL) {
    throw new Error('SLACK_WEBHOOK or SLACK_WEBHOOK_URL env variable is not configured')
  }
  const webhookUrl = SLACK_WEBHOOK_URL || SLACK_WEBHOOK

  logger.debug(`sending message to slack via incoming webhook`)
  return httpreq(webhookUrl!, {
    method: 'POST',
    body: {
      ...getDefaultsParams(),
      ...message,
    },
  })
}

// https://api.slack.com/methods/chat.postMessage
function chatPostMessage(message: SlackMessage, opts: SlackSendOpts = {}): Promise<HttpResponseSuccess<unknown>> {
  const { env = defaultEnv } = opts
  const SLACK_TOKEN = readPvmEnv('SLACK_TOKEN', env)

  if (!SLACK_TOKEN) {
    throw new Error('SLACK_TOKEN env variable is not configured')
  }

  const url = `${SLACK_API_URL}/chat.postMessage`
  logger.debug(`sending message to slack via chat.postMessage api method`)
  const body = {
    ...getDefaultsParams(),
    ...message,
  }
  logger.silly(JSON.stringify(body))
  return httpreq(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${SLACK_TOKEN}`,
    },
    body,
  })
}

function readPvmEnv(name: string, env = defaultEnv): string | undefined {
  return env[name] ?? env[`PVM_${name}`]
}

async function sendMessage(config: Config, message: SlackMessage, opts: SlackSendOpts = {}): Promise<HttpResponseSuccess<unknown> | void> {
  const { slack_auth = {} } = config
  const { env = defaultEnv } = opts

  const SLACK_WEBHOOK = readPvmEnv('SLACK_WEBHOOK', env)
  const SLACK_WEBHOOK_URL = readPvmEnv('SLACK_WEBHOOK_URL', env)
  const SLACK_TOKEN = readPvmEnv('SLACK_TOKEN', env) ?? slack_auth.token

  // Если передали SLACK_API_URL, то скорее всего хотим таки вызывать пуш нотификации и сервер замокирован
  if ((env.PVM_TESTING_ENV && !env.SLACK_API_URL) || env.PVM_EXTERNAL_DRY_RUN) {
    logger.log(
      'PVM_TESTING_ENV or PVM_EXTERNAL_DRY_RUN env variable present. Log message to stdout instead of sending to slack api.'
    )
    logger.log(JSON.stringify(message))
    return
  }

  let response
  if (SLACK_WEBHOOK || SLACK_WEBHOOK_URL) {
    response = await webhookSend(message, opts)
  } else if (SLACK_TOKEN) {
    response = await chatPostMessage(message, opts)
  } else {
    logger.warn('Neither SLACK_WEBHOOK_URL nor SLACK_TOKEN env variables have been configured. Unable to send message to slack:')
    logger.warn(JSON.stringify(message))
  }

  if (response) {
    logger.log(`Slack response:
Status: ${response.statusCode}
Body: ${JSON.stringify(response.json, null, 2)}`)
  }
}

export {
  webhookSend,
  chatPostMessage,
  sendMessage,
}
