import { projectPagesGen } from '../pages-gen'
import type { Container } from '@pvm/pvm'

// https://docs.gitlab.com/ee/api/labels.html#list-labels
function labels(di: Container, projectId: string, queryArgs = {}) {
  return projectPagesGen(di, projectId, `/labels`, queryArgs)
}

export default labels
