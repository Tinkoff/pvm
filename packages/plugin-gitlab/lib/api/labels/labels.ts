import { projectPagesGen } from '../pages-gen'
import type { Config } from '@pvm/pvm'

// https://docs.gitlab.com/ee/api/labels.html#list-labels
function labels(config: Config, projectId, queryArgs = {}) {
  return projectPagesGen(config, projectId, `/labels`, queryArgs)
}

export default labels
