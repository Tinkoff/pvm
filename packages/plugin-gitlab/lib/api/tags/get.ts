import glapi from '../index'
import type { HttpResponseSuccess, Container } from '@pvm/pvm'

export interface GitlabTagRelease {
  tag_name: string,
  description: string,
}

export interface GitlabTagResult {
  name: string,
  target: string,
  release: GitlabTagRelease | null,
  message: string | null,
}

// https://docs.gitlab.com/ee/api/tags.html#get-a-single-repository-tag
async function getTag(di: Container, projectId: string, tagName: string): Promise<HttpResponseSuccess<GitlabTagResult>> {
  return await glapi<GitlabTagResult>(di, `/projects/${encodeURIComponent(projectId)}/repository/tags/${encodeURIComponent(tagName)}`)
}

export default getTag
