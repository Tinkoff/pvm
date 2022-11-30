import glapi from '../index'
import type { Container } from '@pvm/pvm'

// https://docs.gitlab.com/ee/api/tags.html#create-a-new-tag
function createTag(di: Container, projectId, data) {
  return glapi(di, `/projects/${encodeURIComponent(projectId)}/repository/tags`, {
    method: 'POST',
    body: data,
  })
}

export default createTag
