
function reformat(releaseTag) {
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
