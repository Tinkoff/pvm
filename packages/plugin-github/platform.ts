import parseMd from 'parse-md'
import { Octokit } from 'octokit'
import { createAppAuth } from '@octokit/auth-app'
import { createActionAuth } from '@octokit/auth-action'

import { wdShell, PlatformResult, env, PlatformInterface, releaseTagFilter, getCurrentBranchIgnoreEnv, getHostUrl, gracefullyTruncateText } from '@pvm/pvm'
import type {
  GetReleaseResult,
  VcsRelease,
  CreateReleasePayload, PlatformReleaseTag,
  AlterReleaseResult, MetaComment,
  Config,
} from '@pvm/pvm'
import type { IssueComment, PullRequest } from './types'

import hostedGitInfo from 'hosted-git-info'
import { log } from './logger'
import { dryRun } from '@pvm/pvm/lib/utils'
import type { GlobalFlags } from '@pvm/pvm/lib/cli/global-flags'

export const AuthenticationStrategy = {
  'authApp': createAppAuth,
  // octokit default will be used
  'authToken': undefined,
  'authAction': createActionAuth,
} as const

const MAX_LOG_PROP_LENGTH = 200
const PAGING_PAGES_SLICE = 20

function getSuccessRequestLogTitle(options: any): string {
  const { headers, method, baseUrl, mediaType, url, request, ...printableData } = options
  return `${options.method} ${options.url} ${JSON.stringify(printableData)}`
}

function getFailedRequestLogTitle(error): string {
  let loggedBody
  if (error.request.body) {
    loggedBody = JSON.parse(error.request.body)
    Object.keys(loggedBody).forEach(k => {
      loggedBody[k] = gracefullyTruncateText(loggedBody[k].toString(), MAX_LOG_PROP_LENGTH, '...')
    })
  }
  return `${error.response.status}: ${error.request.method} ${error.request.url} ${loggedBody ? JSON.stringify(loggedBody, null, 2) : ''}`
}

export class GithubPlatform extends PlatformInterface<PullRequest> {
  public currentMr: PullRequest | null = null;
  private githubClient: Octokit
  private githubRepoPath: { repo: string, owner: string }
  private config: Config;

  static getAuthStrategy(config: Config): typeof createAppAuth | typeof createActionAuth | undefined {
    let resultStrategy

    if (env.PVM_GITHUB_AUTH_STRATEGY) {
      const strategy = AuthenticationStrategy[env.PVM_GITHUB_AUTH_STRATEGY]

      if (!strategy) {
        throw new Error('No authentication strategy, specified by variable env.PVM_GITHUB_AUTH_STRATEGY, found')
      }

      resultStrategy = strategy
    } else if (config.github.auth_strategy) {
      resultStrategy = AuthenticationStrategy[config.github.auth_strategy]
    } else {
      resultStrategy = env.CI ? AuthenticationStrategy.authAction : AuthenticationStrategy.authToken
    }

    log.info(`Result auth strategy is ${resultStrategy ?? '"default"'}`)

    return resultStrategy
  }

  static getRepoUrlParts(cwd: string): { owner: string, repo: string } {
    let resultRepo

    const repoUrl = wdShell(cwd, 'git remote get-url origin')
    const info = hostedGitInfo.fromUrl(repoUrl)

    if (info?.type === 'github') {
      resultRepo = {
        owner: info.user,
        repo: info.project,
      }
    }

    if (!resultRepo) {
      throw new Error('Can\'t figure out github repository owner and repo name. Maybe it is not a github repo after all.')
    }

    log.debug(`Result repository path is ${JSON.stringify(resultRepo)}`)

    return resultRepo
  }

  constructor({ config, globalFlags }: { config: Config, globalFlags: GlobalFlags }) {
    super()
    this.config = config
    this.githubClient = new Octokit({
      authStrategy: GithubPlatform.getAuthStrategy(config),
      auth: env.GITHUB_TOKEN,
      log,
      baseUrl: config.github.api_url,
    })

    this.dryRun = globalFlags.getFlag('dryRun')
    this.localMode = globalFlags.getFlag('localMode')
    this.githubRepoPath = GithubPlatform.getRepoUrlParts(this.config.cwd)

    this.setupClientHooks()
  }

  private setupClientHooks() {
    this.githubClient.hook.after('request', (response, options) => {
      log.info(`${response.status}: ${getSuccessRequestLogTitle(options)}`)
    })
    this.githubClient.hook.error('request', (error) => {
      if ('response' in error && error.response !== undefined) {
        log.error(`${getFailedRequestLogTitle(error)}\n${error.message}`)
      }
      throw error
    })
  }

  async getRelease(tagName: string): Promise<GetReleaseResult> {
    try {
      const { data: { body, tag_name, name } } = await this.githubClient.rest.repos.getReleaseByTag({
        ...this.githubRepoPath,
        tag: tagName,
      })

      return [PlatformResult.OK, {
        name: name ?? tag_name,
        description: body ?? '',
      }]
    } catch (e) {
      if (e.statusCode === 404) {
        return [PlatformResult.NO_SUCH_TAG, null]
      }
      throw e
    }
  }

  async * releasesIterator(): AsyncGenerator<VcsRelease, void, any> {
    const releasesIterator = this.githubClient.paginate.iterator('GET /repos/{owner}/{repo}/releases', {
      ...this.githubRepoPath,
      per_page: PAGING_PAGES_SLICE,
      page: 1,
    })

    for await (const { data: releases } of releasesIterator) {
      for (const release of releases) {
        yield {
          ...release,
          name: release.name ?? release.tag_name,
          description: release.body ?? '',
          commit: {
            id: release.target_commitish,
          },
        }
      }
    }
  }

  async * releaseTagsIterator(): AsyncGenerator<PlatformReleaseTag, void, any> {
    const isReleaseTag = releaseTagFilter(this.config)
    const tagsIterator = this.githubClient.paginate.iterator('GET /repos/{owner}/{repo}/tags', {
      ...this.githubRepoPath,
      per_page: PAGING_PAGES_SLICE,
      page: 1,
    })

    for await (const { data: tags } of tagsIterator) {
      for (const tag of tags) {
        if (isReleaseTag(tag.name)) {
          yield {
            name: tag.name,
          }
        }
      }
    }
  }

  requireMr(): PullRequest {
    const { currentMr } = this
    if (!currentMr) {
      throw new Error('current merge request not defined, forgot to call beginMrAttribution ?')
    }
    return currentMr
  }

  async beginMrAttribution() {
    if (!env.GITHUB_RUN_ID) {
      throw new Error(`GITHUB_RUN_ID env required for pull request attribution`)
    }

    const { data: run } = await this.githubClient.rest.actions.getWorkflowRun({
      ...this.githubRepoPath,
      run_id: Number(env.GITHUB_RUN_ID),
    })

    const pr = run?.pull_requests?.[0]
    if (!pr) {
      throw new Error(`No associated pull requests found for run ${env.GITHUB_RUN_ID}`)
    }

    this.currentMr = pr
  }

  @dryRun
  async addTag(ref: string, tag_name: string): Promise<unknown> {
    return await this.githubClient.rest.git.createRef({
      ...this.githubRepoPath,
      ref: `refs/tags/${tag_name}`,
      sha: ref,
    })
  }

  @dryRun
  async addTagAndRelease(ref: string, tag_name: string, data: CreateReleasePayload): Promise<AlterReleaseResult> {
    const { data: release } = await this.githubClient.rest.repos.createRelease({
      ...this.githubRepoPath,
      name: data.name,
      body: data.description,
      tag_name,
      target_commitish: ref,
    })

    this.logReleaseTag(tag_name)

    return {
      id: release.id.toString(),
    }
  }

  @dryRun
  async createRelease(tag_name: string, data: CreateReleasePayload): Promise<AlterReleaseResult> {
    // createRelease creating the tag if not find one, so perform separate check and fail before if tag not existing
    await this.githubClient.rest.git.getRef({
      ...this.githubRepoPath,
      ref: `tags/${tag_name}`,
    })

    const { data: release } = await this.githubClient.rest.repos.createRelease({
      ...this.githubRepoPath,
      name: data.name,
      body: data.description,
      tag_name,
    })

    this.logReleaseTag(tag_name)

    return {
      id: release.id.toString(),
    }
  }

  @dryRun
  async editRelease(tag: string, data: CreateReleasePayload): Promise<AlterReleaseResult> {
    const { data: { id: release_id } } = await this.githubClient.rest.repos.getReleaseByTag({
      ...this.githubRepoPath,
      tag,
    })
    const { data: release } = await this.githubClient.rest.repos.updateRelease({
      ...this.githubRepoPath,
      name: data.name,
      body: data.description,
      release_id,
    })

    return {
      id: release.id.toString(),
    }
  }

  @dryRun
  async upsertRelease(tagName: string, data: CreateReleasePayload): Promise<AlterReleaseResult> {
    try {
      const res = await this.createRelease(tagName, data)

      this.logReleaseTag(tagName)

      return res
    } catch (e) {
      if (e.response.data.errors.find(e => e.code === 'already_exists')) {
        return this.editRelease(tagName, data)
      }

      throw e
    }
  }

  async findMrNote(kind: string): Promise<MetaComment<IssueComment & { body: string }> | void> {
    const iid = this.requireMr().number
    const notesIterator = this.githubClient.paginate.iterator('GET /repos/{owner}/{repo}/issues/{issue_number}/comments', {
      ...this.githubRepoPath,
      issue_number: iid,
      per_page: PAGING_PAGES_SLICE,
      page: 1,
    })

    for await (const notes of notesIterator) {
      for (const note of notes.data) {
        let parseResult
        const noteBody = note.body ?? ''
        try {
          parseResult = parseMd(noteBody)
        } catch (e) {
          console.error(`couldn't parse comment for note with id=${note.id}, skip it`)
          console.error(e)
          continue
        }
        const { metadata, content } = parseResult

        if (metadata && metadata.kind === kind) {
          return {
            metadata,
            content,
            note: {
              ...note,
              body: noteBody,
            },
          }
        }
      }
    }
  }

  @dryRun
  async createMrNote(noteBody: string): Promise<IssueComment> {
    const { data: issueComment } = await this.githubClient.rest.issues.createComment({
      ...this.githubRepoPath,
      issue_number: this.requireMr().number,
      body: noteBody,
    })

    return issueComment
  }

  @dryRun
  async updateMrNote(commentId: number, noteBody: string): Promise<IssueComment> {
    const { data: issueComment } = await this.githubClient.rest.issues.updateComment({
      ...this.githubRepoPath,
      comment_id: commentId,
      body: noteBody,
    })

    return issueComment
  }

  @dryRun
  async syncAttachment(_kind: string, _attachment: Buffer, _opts: any): Promise<unknown> {
    return Promise.reject(new Error('Attachments for pull requests are not supported at this moment'))
  }

  async * getProjectLabels(): AsyncIterable<{ name: string }> {
    const labelsIter = this.githubClient.paginate.iterator('GET /repos/{owner}/{repo}/labels', {
      ...this.githubRepoPath,
    })

    for await (const labels of labelsIter) {
      yield * labels.data
    }
  }

  @dryRun
  async createProjectLabel(label: string, color: string): Promise<unknown> {
    return (await this.githubClient.rest.issues.createLabel({
      ...this.githubRepoPath,
      name: label,
      color,
    })).data
  }

  @dryRun
  async setMrLabels(labels: string[]): Promise<unknown> {
    return await this.githubClient.rest.issues.addLabels({
      ...this.githubRepoPath,
      issue_number: this.requireMr().number,
      labels,
    })
  }

  async getCommitLink(commit: string): Promise<string> {
    return `${env.GITHUB_SERVER_URL}/${this.githubRepoPath.owner}/${this.githubRepoPath.repo}/commit/${commit}`
  }

  getCurrentBranch(): string | undefined {
    return env.GITHUB_HEAD_REF || env.GITHUB_REF_NAME || getCurrentBranchIgnoreEnv(this.config.cwd)
  }

  async fetchLatestSha(refName: string): Promise<string> {
    const { data: commits } = await this.githubClient.rest.repos.listCommits({
      ...this.githubRepoPath,
      sha: refName,
      per_page: 1,
    })

    return commits.length ? commits[0].sha : '0000000000000000000000000000000000000000'
  }

  getCommitSha(): string {
    return env.GITHUB_SHA ?? wdShell(this.config.cwd, 'git rev-parse HEAD')
  }

  async getUpdateHintsByCommit(_commit: string): Promise<Record<string, any> | null> {
    return null
  }

  private logReleaseTag(tagName: string): void {
    log.info(`release tag link: ${getHostUrl(this.config.cwd)}/${this.githubRepoPath.owner}/${this.githubRepoPath.repo}/tags/${tagName}`)
  }
}
