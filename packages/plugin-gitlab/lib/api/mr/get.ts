import glapi from '../index'
import type { UriSlug } from '../api-helpers'
import { encodeSlug } from '../api-helpers'
import type { MergeRequest } from './types'
import type { Container } from '@pvm/pvm'

async function getMergeRequest(di: Container, projectId: UriSlug, mrIid: number): Promise<MergeRequest> {
  const { json } = await glapi(di, `/projects/${encodeSlug(projectId)}/merge_requests/${mrIid}`)
  return json
}

export default getMergeRequest
