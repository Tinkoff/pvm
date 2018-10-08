import { projectPagesGen } from '../pages-gen'
import { releaseTagPrefix, releaseTagFilter } from '@pvm/core/lib/tag-meta'
import type { HttpReqOptions } from '@pvm/core/lib/httpreq'
import { getConfig } from '@pvm/core/lib/config'

// https://docs.gitlab.com/ee/api/tags.html#list-project-repository-tags
async function * tags(projectId, queryArgs, fetchOpts: HttpReqOptions = {}) {
  yield * projectPagesGen(projectId, `/repository/tags`, queryArgs, fetchOpts)
}

async function * releaseTags(projectId, fetchOpts: HttpReqOptions = {}) {
  const config = await getConfig()
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
