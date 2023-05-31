import type { VcsRelease } from '@pvm/pvm'

function reformat(releaseTag: {
  [key: string]: unknown,
  id: string,
  name: string,
  release?: {
    description: string,
  },
  commit: {
    id: string,
    created_at: string,
  },
}): VcsRelease & { author: Record<string, any>, assets: {
    count: number,
    sources: string[],
    links: string[],
  }, } {
  return {
    ...releaseTag,
    name: releaseTag.name,
    tag_name: releaseTag.name,
    description: releaseTag.release ? releaseTag.release.description : '',
    created_at: releaseTag.commit.created_at,
    author: {},
    assets: {
      count: 0,
      sources: [],
      links: [],
    },
  }
}

export default reformat
