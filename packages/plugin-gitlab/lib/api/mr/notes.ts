import { projectPagesGen } from '../pages-gen'
import type { Container } from '@pvm/pvm'

// https://docs.gitlab.com/ee/api/notes.html#list-all-merge-request-notes
function getNotes(di: Container, projectId: string, mrIid: number, queryArgs = {}) {
  return projectPagesGen(di, projectId, `/merge_requests/${mrIid}/notes`, queryArgs)
}

export default getNotes
