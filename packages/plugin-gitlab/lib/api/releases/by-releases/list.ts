import type { Container } from '@pvm/pvm'
import type { QueryArgs } from '../../pages-gen'
import { projectPagesGen } from '../../pages-gen'

// https://docs.gitlab.com/ee/api/releases/index.html#list-releases
function tags(di: Container, projectId: string, queryArgs: QueryArgs) {
  return projectPagesGen(di, projectId, `/releases`, queryArgs)
}

export default tags
