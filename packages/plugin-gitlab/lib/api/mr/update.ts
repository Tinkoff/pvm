import glapi from '../index'
import type { Config } from '@pvm/pvm'

function update(config: Config, projectId, mrIid, attrs = {}) {
  return glapi(config, `/projects/${encodeURIComponent(projectId)}/merge_requests/${mrIid}`, {
    method: 'PUT',
    body: attrs,
  })
}

export default update
