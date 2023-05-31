import { releaseTagFilter } from '../tag-meta'
import type { Config } from '../../types'
import { getTagsPointsAt } from './commands'

// релизный тэг на заданной ревизии
function releaseTagFor(config: Config, ref: string): string | undefined {
  return getTagsPointsAt(config.cwd, ref)
    .filter(releaseTagFilter(config))[0]
}

export default releaseTagFor
