import { URL } from 'url'
import glapi from './index'
import { pagingMeta } from '@pvm/pvm'
import type { HttpReqOptions, HttpResponseSuccess, Container } from '@pvm/pvm'
import type { UriSlug } from './api-helpers'
import { encodeSlug } from './api-helpers'

export interface QueryArgs {
  page?: number,
  [key: string]: string | number | undefined,
}

// https://docs.gitlab.com/ee/api/#pagination
async function * httpPagesGen<T = any>(di: Container,
  href: string, queryArgs: QueryArgs = {}, fetchOpts: HttpReqOptions = {}
): AsyncIterableIterator<HttpResponseSuccess<Array<T>>> {
  let page = queryArgs.page || 1
  let totalPages = 1

  const url = new URL(href, 'https://gitlab.example.com')

  for (const key of Object.keys(queryArgs)) {
    url.searchParams.set(key, String(queryArgs[key]))
  }

  do {
    url.searchParams.set('page', String(page))
    const response = await glapi<Array<T>>(di,
      `${url.pathname}${url.search}`,
      fetchOpts
    )
    totalPages = Number(response.headers['x-total-pages'])

    yield response
  } while (page++ < totalPages)
}

// https://docs.gitlab.com/ee/api/#pagination
async function * pagesGen<T = any>(di: Container, url: string, queryArgs: QueryArgs = {}, fetchOpts: HttpReqOptions = {}): AsyncIterableIterator<T> {
  for await (const response of httpPagesGen<T>(di, url, queryArgs, fetchOpts)) {
    const data = response.json as any
    if (data) {
      const metaTarget = Array.isArray(data) ? data[0] : data
      if (typeof metaTarget === 'object' && metaTarget) {
        metaTarget[pagingMeta] = {
          totalPages: Number(response.headers['x-total-pages']),
          total: Number(response.headers['x-total']),
        }
      }
    }
    yield * data
  }
}

async function * projectPagesGen<T = any>(di: Container,
  projectId: UriSlug, url: string, queryArgs: QueryArgs = {}, fetchOpts: HttpReqOptions = {}
): AsyncIterableIterator<T> {
  yield * pagesGen<T>(di, `/projects/${encodeSlug(projectId)}${url}`, queryArgs, fetchOpts)
}

export {
  httpPagesGen,
  pagesGen,
  projectPagesGen,
}
