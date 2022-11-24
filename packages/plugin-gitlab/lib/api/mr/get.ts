import glapi from '../index'
import type { UriSlug } from '../api-helpers'
import { encodeSlug } from '../api-helpers'
import type { MergeRequest } from './types'

async function getMergeRequest(projectId: UriSlug, mrIid: number): Promise<MergeRequest> {
  const { json } = await glapi(`/projects/${encodeSlug(projectId)}/merge_requests/${mrIid}`)
  return json
}

export default getMergeRequest
