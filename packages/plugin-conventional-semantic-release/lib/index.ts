import { analyzeCommits } from './analyze-commits'

import type { PvmReleaseType, ConventionalCommit } from '@pvm/pvm'
import { declarePlugin, provide } from '@pvm/pvm'
import type { Options } from './types'
import { RELEASE_TYPE_BUILDER_TOKEN } from '@pvm/pvm/tokens'

export default declarePlugin({
  factory: (opts: Options = {}) => {
    return {
      providers: [
        provide({
          provide: RELEASE_TYPE_BUILDER_TOKEN,
          useValue: function releaseTypeBuilder(commits: ConventionalCommit[]): Promise<PvmReleaseType> {
            return Promise.resolve(analyzeCommits(commits, opts))
          },
        }),
      ],
    }
  },
})
