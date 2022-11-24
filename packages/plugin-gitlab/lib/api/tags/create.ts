import glapi from '../index'
import type { Config } from '@pvm/pvm'

// https://docs.gitlab.com/ee/api/tags.html#create-a-new-tag
function createTag(config: Config, projectId, data) {
  return glapi(config, `/projects/${encodeURIComponent(projectId)}/repository/tags`, {
    method: 'POST',
    body: data,
  })
}

export default createTag
