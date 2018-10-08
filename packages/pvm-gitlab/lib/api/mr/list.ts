import { projectPagesGen } from '../pages-gen'
import type { MergeRequest } from './types'

function list(projectId, queryArgs): AsyncIterableIterator<MergeRequest> {
  return projectPagesGen<MergeRequest>(projectId, `/merge_requests`, queryArgs)
}

export default list
