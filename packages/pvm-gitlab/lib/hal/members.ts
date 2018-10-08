import type { PublicMember } from '../../types/api/people'
import type { UriSlug } from '../api/api-helpers'
import { projectPagesGen } from '../api/pages-gen'
import gitalbEnv from '../env'

async function * getProjectMembers(projectId: UriSlug = gitalbEnv.projectId): AsyncIterableIterator<PublicMember> {
  const seenUsers = new Set<string>()

  // итерируем сначала по прямым членам проекта, т.к. там данные более точные в контексте самого проекта
  for await (const user of projectPagesGen<PublicMember>(projectId, `/members`)) {
    if (user.state === 'active') {
      yield user
      seenUsers.add(user.username)
    }
  }

  for await (const user of projectPagesGen<PublicMember>(projectId, `/members/all`)) {
    if (user.state === 'active' && !seenUsers.has(user.username)) {
      yield user
    }
  }
}

async function * getMaintainers(projectId: UriSlug = gitalbEnv.projectId): AsyncIterableIterator<PublicMember> {
  for await (const user of getProjectMembers(projectId)) {
    if (user.access_level === 40) {
      yield user
    }
  }
}

export {
  getProjectMembers,
  getMaintainers,
}
