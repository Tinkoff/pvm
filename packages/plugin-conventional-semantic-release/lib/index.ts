import { analyzeCommits } from './analyze-commits'

import type { Commit } from 'conventional-commits-parser'
import type { PvmReleaseType, PluginsApi } from '@pvm/pvm'
import type { Options } from './types'

export default function plugin(api: PluginsApi, opts: Options = {}): void {
  api.provides(api.features.releaseTypeBuilder, () => {
    return function releaseTypeBuilder(commits: Commit[]): PvmReleaseType {
      return analyzeCommits(commits, opts)
    }
  })
}
