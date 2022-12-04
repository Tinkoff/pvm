import type { Container } from '@pvm/pvm'
import glapi from '../index'

// https://docs.gitlab.com/ee/api/labels.html#create-a-new-label

function createLabel(di: Container, projectId: string, label: Record<string, string>) {
  return glapi(di, `/projects/${encodeURIComponent(projectId)}/labels`, {
    method: 'POST',
    body: label,
  })
}

export default createLabel
