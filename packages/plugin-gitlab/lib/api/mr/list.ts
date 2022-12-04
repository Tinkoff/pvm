import type { Container } from '@pvm/pvm'
import type { QueryArgs } from '../pages-gen'
import { projectPagesGen } from '../pages-gen'
import type { MergeRequest } from './types'

function list(di: Container, projectId: string, queryArgs: QueryArgs): AsyncIterableIterator<MergeRequest> {
  return projectPagesGen<MergeRequest>(di, projectId, `/merge_requests`, queryArgs)
}

export default list
