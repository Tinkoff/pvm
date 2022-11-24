import { releaseTags } from '../../tags/tags'
import reformat from './reformat'

const hasReleaseDescription = (tag): boolean => {
  return !!tag.release && !!tag.release.description
}

async function * releases(projectId) {
  for await (const tag of releaseTags(projectId)) {
    if (hasReleaseDescription(tag)) {
      yield reformat(tag)
    }
  }
}

export default releases
