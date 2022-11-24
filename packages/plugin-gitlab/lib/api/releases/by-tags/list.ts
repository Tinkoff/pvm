import { releaseTags } from '../../tags/tags'
import reformat from './reformat'
import type { Config } from '@pvm/pvm'

const hasReleaseDescription = (tag): boolean => {
  return !!tag.release && !!tag.release.description
}

async function * releases(config: Config, projectId) {
  for await (const tag of releaseTags(config, projectId)) {
    if (hasReleaseDescription(tag)) {
      yield reformat(tag)
    }
  }
}

export default releases
