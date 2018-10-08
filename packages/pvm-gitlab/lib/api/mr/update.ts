import glapi from '../index'

function update(projectId, mrIid, attrs = {}) {
  return glapi(`/projects/${encodeURIComponent(projectId)}/merge_requests/${mrIid}`, {
    method: 'PUT',
    body: attrs,
  })
}

export default update
