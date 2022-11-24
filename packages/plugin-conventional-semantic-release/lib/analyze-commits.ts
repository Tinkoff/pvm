import type { Commit } from 'conventional-commits-parser'
import DEFAULT_RELEASE_RULES from '@semantic-release/commit-analyzer/lib/default-release-rules'
import compareReleaseTypes from '@semantic-release/commit-analyzer/lib/compare-release-types'
import RELEASE_TYPES from '@semantic-release/commit-analyzer/lib/default-release-types'
import analyzeCommit from '@semantic-release/commit-analyzer/lib/analyze-commit'
import { logger } from './logger'
import type { PvmReleaseType } from '@pvm/pvm'
import type { Options } from './types'

// taken from https://github.com/semantic-release/commit-analyzer/blob/master/index.js
export function analyzeCommits(commits: Commit[], { releaseRules }: Options): PvmReleaseType {
  let releaseType: PvmReleaseType | undefined

  commits.every((commit) => {
    let commitReleaseType
    // Determine release type based on custom releaseRules
    if (releaseRules) {
      logger.debug('Analyzing with custom rules')
      commitReleaseType = analyzeCommit(releaseRules, commit)
    }

    // If no custom releaseRules or none matched the commit, try with default releaseRules
    if (commitReleaseType === undefined) {
      logger.debug('Analyzing with default rules')
      commitReleaseType = analyzeCommit(DEFAULT_RELEASE_RULES, commit)
    }

    if (commitReleaseType) {
      logger.debug('The release type for the commit is %s', commitReleaseType)
    } else {
      logger.debug('The commit should not trigger a release')
    }

    // Set releaseType if commit's release type is higher
    if (commitReleaseType && compareReleaseTypes(releaseType, commitReleaseType)) {
      releaseType = commitReleaseType
    }

    // Break loop if releaseType is the highest
    return releaseType !== RELEASE_TYPES[0]
  })

  return releaseType ?? 'none'
}
