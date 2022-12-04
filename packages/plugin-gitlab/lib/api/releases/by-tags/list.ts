import { releaseTags } from '../../tags/tags'
import reformat from './reformat'
import type { Container } from '@pvm/pvm'

const hasReleaseDescription = (tag: { release?: { description?: any }}): boolean => {
  return !!tag.release && !!tag.release.description
}

async function * releases(di: Container, projectId: string) {
  for await (const tag of releaseTags(di, projectId)) {
    if (hasReleaseDescription(tag)) {
      yield reformat(tag)
    }
  }
}

export default releases
