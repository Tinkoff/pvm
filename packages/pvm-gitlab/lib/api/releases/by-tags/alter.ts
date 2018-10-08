import glapi from '../../index'

import type { AlterReleaseResult, EditReleasePayload, CreateReleasePayload } from '../types'

async function addTagAndRelease(projectId: string | number, ref: string, data: CreateReleasePayload): Promise<AlterReleaseResult> {
  const payload: Record<string, string> = {
    ref: ref,
    tag_name: data.tag_name,
  }
  if (data.annotation) {
    payload.message = data.annotation
  }
  const encodedProjectId = encodeURIComponent(projectId)
  await glapi(`/projects/${encodedProjectId}/repository/tags`, {
    method: 'POST',
    body: payload,
  })

  await glapi(`/projects/${encodedProjectId}/releases`, {
    method: 'POST',
    body: {
      tag_name: data.tag_name,
      description: data.description,
    },
  })

  return {
    id: data.tag_name,
  }
}

async function createRelease(projectId: string | number, data: EditReleasePayload): Promise<AlterReleaseResult> {
  await glapi(`/projects/${encodeURIComponent(projectId)}/releases`, {
    method: 'POST',
    body: {
      tag_name: data.tag_name,
      description: data.description,
    },
  })

  return {
    id: data.tag_name,
  }
}

// тег должен существовать, если тега нет – метод упадет
async function upsertRelease(projectId: string | number, data: EditReleasePayload): Promise<AlterReleaseResult> {
  try {
    await createRelease(projectId, data)
  } catch (e) {
    if (e.statusCode === 409) {
      // релиз уже есть, и нам нужно его отредактировать в этом случае
      return await updateRelease(projectId, data)
    }
    throw e
  }

  return {
    id: data.tag_name,
  }
}

// we only can update description
// https://docs.gitlab.com/ee/api/tags.html#update-a-release
async function updateRelease(projectId: string | number, data: EditReleasePayload): Promise<AlterReleaseResult> {
  await glapi(`/projects/${encodeURIComponent(projectId)}/releases`, {
    method: 'PUT',
    body: {
      tag_name: data.tag_name,
      description: data.description,
    },
  })

  return {
    id: data.tag_name,
  }
}

export {
  addTagAndRelease,
  createRelease,
  upsertRelease,
  updateRelease,
}
