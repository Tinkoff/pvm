import { projectPagesGen } from '../pages-gen'
import { releaseTagPrefix, releaseTagFilter } from '@pvm/pvm'
import type { HttpReqOptions, Config } from '@pvm/pvm'

// https://docs.gitlab.com/ee/api/tags.html#list-project-repository-tags
async function * tags(config: Config, projectId, queryArgs, fetchOpts: HttpReqOptions = {}) {
  yield * projectPagesGen(config, projectId, `/repository/tags`, queryArgs, fetchOpts)
}

async function * releaseTags(config: Config, projectId, fetchOpts: HttpReqOptions = {}) {
  const tagPrefix = releaseTagPrefix(config)
  // @TODO: isReleaseTag логику надо вынести выше, чтобы работало на всех типах vcs
  const isReleaseTag = releaseTagFilter(config)

  const queryArgs = {
    search: tagPrefix,
  }
  for await (const tag of tags(projectId, queryArgs, fetchOpts)) {
    if (isReleaseTag(tag.name)) {
      yield tag
    }
  }
}

export default tags
export {
  releaseTags,
}
