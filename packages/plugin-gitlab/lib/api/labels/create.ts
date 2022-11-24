import glapi from '../index'

// https://docs.gitlab.com/ee/api/labels.html#create-a-new-label

function createLabel(projectId, label) {
  return glapi(`/projects/${encodeURIComponent(projectId)}/labels`, {
    method: 'POST',
    body: label,
  })
}

export default createLabel
