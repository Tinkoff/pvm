import type { RequestOptions } from 'https'
import https from 'https'
import type { IncomingMessage } from 'http'
import http from 'http'

import { URL } from 'url'
import { loggerFor } from './logger'
import { cutText } from './text'

export interface HttpReqOptions extends RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'OPTIONS' | 'HEAD' | 'CONNECT',
  body?: any,
}

export interface HttpReqError extends Error {
  statusCode: number | undefined,
}

export interface HttpResponseSuccess<T = any> {
  headers: IncomingMessage['headers'],
  statusCode: IncomingMessage['statusCode'],
  body: string,
  json: T,
}

const logger = loggerFor('pvm:http')

function extractErrorMessage(jsonData: any, rawData: string): string {
  const message = jsonData?.message || jsonData?.error
  if (typeof message === 'string') {
    return message
  }
  if (!jsonData && rawData) {
    return rawData
  }
  return cutText(JSON.stringify(jsonData), 190)
}

export default function request<T = any>(urlString: string, opts: HttpReqOptions = {}): Promise<HttpResponseSuccess<T>> {
  const url = new URL(urlString)
  const { headers = {}, method = 'GET' } = opts
  logger.debug(`making http ${method} request to ${urlString}`)

  let postData = opts.body
  let defaultHeaders

  switch (true) {
    case Buffer.isBuffer(opts.body): {
      break
    }
    case opts.body !== void 0:
      postData = JSON.stringify(opts.body)
      defaultHeaders = {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
      }
  }

  const options: RequestOptions = {
    hostname: url.hostname,
    path: url.pathname + url.search,
    rejectUnauthorized: false,
    headers: {
      ...headers,
    },
    method,
  }
  if (url.port) {
    options.port = Number(url.port)
  }

  if (defaultHeaders) {
    options.headers = Object.assign(defaultHeaders, options.headers)
  }

  const httpIml = url.protocol === 'https:' ? https : http

  return new Promise((resolve, reject) => {
    let data = ''
    let jsonData: T | null = null

    const req = httpIml.request(options, res => {
      res.setEncoding('utf8')

      res.on('data', (chunk) => {
        data += chunk
      })

      res.on('end', () => {
        try {
          jsonData = JSON.parse(data)
        } catch (ex) {}

        logger.debug(`${method} to ${urlString} returns ${res.statusCode}`)

        if (!res.statusCode || res.statusCode >= 400) {
          logger.warn(`Failed to ${method} ${urlString}`)
          logger.warn(data)
          const error = new Error(extractErrorMessage(jsonData, data)) as HttpReqError
          error.statusCode = res.statusCode

          reject(error)
        } else {
          resolve({
            headers: res.headers,
            statusCode: res.statusCode,
            body: data,
            json: jsonData as T,
          })
        }
      })
    })
    req.on('error', e => {
      logger.error(`request error ${e.toString()}`)
      reject(e && e.message)
    })

    if (postData) {
      req.write(postData)
    }
    req.end()
  })
}

const defaultRetryTimeouts = [
  1000, 3000, 10000, 15000, 25000,
]

const defaultRetryCodes = [
  429,
]

function wait(ms): Promise<void> {
  return new Promise(resolve => {
    setTimeout(resolve, ms)
  })
}

export async function requestWithRetries(requestFn: () => any, retryOpts: { retryCodes?: number[], timeouts?: number[] } = {}, retryIndex = 0) {
  const {
    timeouts = defaultRetryTimeouts,
    retryCodes = defaultRetryCodes,
  } = retryOpts
  try {
    return await requestFn()
  } catch (e) {
    // retry later
    if (retryCodes.indexOf(e.statusCode) !== -1) {
      const timeout = timeouts[retryIndex]
      if (timeout) {
        return wait(timeout).then(() => requestWithRetries(requestFn, retryOpts, retryIndex + 1))
      }
    }
    throw e
  }
}
