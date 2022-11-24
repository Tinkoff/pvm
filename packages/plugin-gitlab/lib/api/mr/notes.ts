import { projectPagesGen } from '../pages-gen'

// https://docs.gitlab.com/ee/api/notes.html#list-all-merge-request-notes
function getNotes(projectId, mrIid, queryArgs = {}) {
  return projectPagesGen(projectId, `/merge_requests/${mrIid}/notes`, queryArgs)
}

export default getNotes
