import type githubApiTypes from '@octokit/openapi-types/types'

export type PullRequest = githubApiTypes.components['schemas']['pull-request-minimal']
export type IssueComment = githubApiTypes.components['schemas']['issue-comment']
