import { projectPagesGen } from '../pages-gen'
import type { Config } from '@pvm/pvm'

// https://docs.gitlab.com/ee/api/notes.html#list-all-merge-request-notes
function getNotes(config: Config, projectId, mrIid, queryArgs = {}) {
  return projectPagesGen(config, projectId, `/merge_requests/${mrIid}/notes`, queryArgs)
}

export default getNotes
