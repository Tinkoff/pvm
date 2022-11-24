import glapi from '../../index'

import type { AlterReleaseResult } from '../types'

// https://docs.gitlab.com/ee/api/releases/index.html#create-a-release
async function createRelease(projectId, data): Promise<AlterReleaseResult> {
  const { json } = await glapi(`/projects/${encodeURIComponent(projectId)}/releases`, {
    method: 'POST',
    body: data,
  })

  return {
    id: json.tag_name,
  }
}

// https://docs.gitlab.com/ee/api/releases/index.html#update-a-release
async function updateRelease(projectId, data): Promise<AlterReleaseResult> {
  const { json } = await glapi(`/projects/${encodeURIComponent(projectId)}/releases/${data.tag_name}`, {
    method: 'POST',
    body: data,
  })

  return {
    id: json.tag_name,
  }
}

export { createRelease as create }
export { updateRelease as update }
