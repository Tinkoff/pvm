import { projectPagesGen } from '../pages-gen'

// https://docs.gitlab.com/ee/api/labels.html#list-labels
function labels(projectId, queryArgs = {}) {
  return projectPagesGen(projectId, `/labels`, queryArgs)
}

export default labels
