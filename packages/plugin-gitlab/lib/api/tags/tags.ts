import type { QueryArgs } from '../pages-gen'
import { projectPagesGen } from '../pages-gen'
import { releaseTagPrefix, releaseTagFilter, CONFIG_TOKEN } from '@pvm/pvm'
import type { HttpReqOptions, Container } from '@pvm/pvm'

// https://docs.gitlab.com/ee/api/tags.html#list-project-repository-tags
async function * tags(di: Container, projectId: string, queryArgs: QueryArgs = {}, fetchOpts: HttpReqOptions = {}) {
  yield * projectPagesGen(di, projectId, `/repository/tags`, queryArgs, fetchOpts)
}

async function * releaseTags(di: Container, projectId: string, fetchOpts: HttpReqOptions = {}) {
  const config = di.get(CONFIG_TOKEN)
  const tagPrefix = releaseTagPrefix(config)
  // @TODO: isReleaseTag логику надо вынести выше, чтобы работало на всех типах vcs
  const isReleaseTag = releaseTagFilter(config)

  const queryArgs = {
    search: tagPrefix,
  }
  for await (const tag of tags(di, projectId, queryArgs, fetchOpts)) {
    if (isReleaseTag(tag.name)) {
      yield tag
    }
  }
}

export default tags
export {
  releaseTags,
}
