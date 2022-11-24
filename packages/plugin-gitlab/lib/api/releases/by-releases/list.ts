import { projectPagesGen } from '../../pages-gen'

// https://docs.gitlab.com/ee/api/releases/index.html#list-releases
function tags(projectId, queryArgs) {
  return projectPagesGen(projectId, `/releases`, queryArgs)
}

export default tags
