import glapi from '../index'
import type { HttpResponseSuccess, Config } from '@pvm/pvm'

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
async function getTag(config: Config, projectId, tagName: string): Promise<HttpResponseSuccess<GitlabTagResult>> {
  return await glapi<GitlabTagResult>(config, `/projects/${encodeURIComponent(projectId)}/repository/tags/${encodeURIComponent(tagName)}`)
}

export default getTag
