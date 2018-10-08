import parseCommitNative from 'conventional-commits-parser'

import type { Options, Commit } from 'conventional-commits-parser'

export const conventionalChangelogParserOpts = {
  breakingHeaderPattern: /^(\w*)(?:\((.*)\))?!: (.*)$/,
  headerPattern: /^(\w*)(?:\((.*)\))?!?: (.*)$/,
}

export function parseCommit(commit: string, options: Options = {}): Commit {
  return parseCommitNative.sync(commit, {
    ...conventionalChangelogParserOpts,
    ...options,
  })
}
