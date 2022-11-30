import glapi from '../../index'

import type { AlterReleaseResult } from '../types'
import type { Container } from '@pvm/pvm'

// https://docs.gitlab.com/ee/api/releases/index.html#create-a-release
async function createRelease(di: Container, projectId, data): Promise<AlterReleaseResult> {
  const { json } = await glapi(di, `/projects/${encodeURIComponent(projectId)}/releases`, {
    method: 'POST',
    body: data,
  })

  return {
    id: json.tag_name,
  }
}

// https://docs.gitlab.com/ee/api/releases/index.html#update-a-release
async function updateRelease(di: Container, projectId, data): Promise<AlterReleaseResult> {
  const { json } = await glapi(di, `/projects/${encodeURIComponent(projectId)}/releases/${data.tag_name}`, {
    method: 'POST',
    body: data,
  })

  return {
    id: json.tag_name,
  }
}

export { createRelease as create }
export { updateRelease as update }
