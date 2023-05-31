import glapi from '../index'
import type { Container } from '@pvm/pvm'

function update(di: Container, projectId: string, mrIid: number, attrs = {}) {
  return glapi(di, `/projects/${encodeURIComponent(projectId)}/merge_requests/${mrIid}`, {
    method: 'PUT',
    body: attrs,
  })
}

export default update
