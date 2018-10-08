import glapi from '../index'

// https://docs.gitlab.com/ee/api/tags.html#create-a-new-tag
function createTag(projectId, data) {
  return glapi(`/projects/${encodeURIComponent(projectId)}/repository/tags`, {
    method: 'POST',
    body: data,
  })
}

export default createTag
