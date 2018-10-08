import fs from 'fs'
import { cwdShell } from '@pvm/core/lib/shell'
import { getContents } from '@pvm/core/lib/git/commands'

import { releasesIterator, updateRelease, createRelease, upsertRelease, addTagAndRelease } from './api/releases'
import { releaseTags } from './api/tags/tags'
import getTag from './api/tags/get'
import createTag from './api/tags/create'
import { PlatformResult } from '@pvm/core/lib/shared'

import type { SyncAttachmentOpts } from './hal/mark-pr'
import { syncAttachment, findNote } from './hal/mark-pr'
import { findOpenSingleMr } from './hal/merge-request'

import gitlabEnv from './env'
import glapi from './api'

import type { MergeRequest } from './api/mr/types'
import type {
  AddTagOptions,
  CommitResult,
  GetReleaseResult,
  CommitOptions, MetaComment,
} from '@pvm/vcs/types'

import type { AlterReleaseResult } from './api/releases/types'
import type { Config } from '@pvm/core/lib/config'
import { getConfig } from '@pvm/core/lib/config'
import { PlatformInterfaceWithFileCommitApi } from '@pvm/vcs/lib/platform-interface'
import createLabel from './api/labels/create'
import getLabels from './api/labels/labels'
import updateMr from './api/mr/update'
import { env } from '@pvm/core/lib/env'
import { log } from '@pvm/core/lib/logger'
import { getGitlabHostUrl } from './remote-url'

interface CommitAction {
  file_path: string,
  [k: string]: any,
}

interface CommitContext {
  branch?: string,
  commit_message: string,
  actions: CommitAction[],
  mods: Record<string, any>,
}

function isFileInitiallyExists(filePath: string): boolean {
  try {
    cwdShell(`git cat-file -e HEAD:"${filePath}"`)
    return true
  } catch (e) {
    return false
  }
}

export class GitlabPlatform extends PlatformInterfaceWithFileCommitApi<MergeRequest, CommitContext> {
  public supportsFileCommitApi = true as const;
  public currentMr: MergeRequest | null = null;
  private config: Config;

  constructor(config: Config) {
    super()
    this.config = config
  }

  setMrLabels(labels: string[]): Promise<unknown> {
    const iid = this.requireMr().iid

    return updateMr(gitlabEnv.projectId, iid, {
      labels: labels.join(','),
    })
  }

  getProjectLabels(): AsyncIterable<Array<{ name: string }>> {
    return getLabels(gitlabEnv.projectId)
  }

  async createProjectLabel(label: string, color: string): Promise<unknown> {
    return await createLabel(gitlabEnv.projectId, {
      name: label,
      color,
    })
  }

  async findMrNote(kind: string): Promise<MetaComment<{
    body: string,
    id: string | number,
  }> | void> {
    const iid = this.requireMr().iid
    return await findNote(iid, kind)
  }

  async createMrNote(body: string): Promise<void> {
    const iid = this.requireMr().iid

    await glapi(`/projects/${gitlabEnv.projectSlug}/merge_requests/${iid}/notes`, {
      method: 'POST',
      body: {
        body,
      },
    })
  }

  async updateMrNote(commentId: number, body: string): Promise<void> {
    const iid = this.requireMr().iid

    await glapi(`/projects/${gitlabEnv.projectSlug}/merge_requests/${iid}/notes/${commentId}`, {
      method: 'PUT',
      body: {
        body,
      },
    })
  }

  async getRelease(tagName: string): Promise<GetReleaseResult> {
    try {
      const { json } = await getTag(gitlabEnv.projectId, tagName)
      const { release } = json
      if (release) {
        return [PlatformResult.OK, {
          name: release.tag_name,
          description: release.description,
        }]
      }
    } catch (e) {
      if (e.statusCode === 404) {
        return [PlatformResult.NO_SUCH_TAG, null]
      }
      throw e
    }
    return [PlatformResult.NOT_FOUND, null]
  }

  releasesIterator() {
    return releasesIterator(gitlabEnv.projectId)
  }

  releaseTagsIterator() {
    return releaseTags(gitlabEnv.projectId)
  }

  requireMr(): MergeRequest {
    const { currentMr } = this
    if (!currentMr) {
      throw new Error('current merge request not defined, forgot to call beginMrAttribution ?')
    }
    return currentMr
  }

  async beginMrAttribution() {
    this.currentMr = await findOpenSingleMr(this.getCurrentBranch())
  }

  async addTagAndRelease(ref: string, tag_name: string, data): Promise<AlterReleaseResult> {
    const res = await addTagAndRelease(gitlabEnv.projectId, ref, {
      ...data, // name and description
      tag_name,
    })

    this.logReleaseTag(tag_name)

    return res
  }

  async createRelease(tag_name: string, data): Promise<AlterReleaseResult> {
    const res = await createRelease(gitlabEnv.projectId, {
      ...data, // name and description
      tag_name,
    })

    this.logReleaseTag(tag_name)

    return res
  }

  async editRelease(tag_name, data): Promise<AlterReleaseResult> {
    return await updateRelease(gitlabEnv.projectId, {
      ...data,
      tag_name,
    })
  }

  async upsertRelease(tagName: string, data): Promise<AlterReleaseResult> {
    const res = await upsertRelease(gitlabEnv.projectId, {
      ...data,
      tag_name: tagName,
    })

    this.logReleaseTag(tagName)

    return res
  }

  syncAttachment(kind: string, attachment: Buffer, opts: SyncAttachmentOpts = {}) {
    return syncAttachment(this.requireMr().iid, kind, attachment, opts)
  }

  beginCommit(): CommitContext {
    return {
      commit_message: '',
      actions: [],
      mods: Object.create(null),
    }
  }

  rollbackCommit(_: CommitContext): Promise<void> {
    // noop
    return Promise.resolve()
  }

  addFiles(commitContext: CommitContext, file_paths: string[]) {
    for (const file_path of file_paths) {
      if (commitContext.mods[file_path]) {
        // если файл уже включен на изменение ничего делать не нужно
        continue
      }
      if (!fs.existsSync(file_path)) {
        throw new Error(`platform.addFiles: file ${file_path} wasn't found`)
      }
      const content = fs.readFileSync(file_path).toString('utf-8')
      commitContext.mods[file_path] = {
        action: isFileInitiallyExists(file_path) ? 'update' : 'create',
        content,
      }
    }
  }

  async updateFile(commitContext: CommitContext, file_path: string, content: string) {
    commitContext.mods[file_path] = {
      action: isFileInitiallyExists(file_path) ? 'update' : 'create',
      content,
    }
  }

  async deleteFile(commitContext: CommitContext, file_path: string) {
    if (file_path in commitContext.mods && commitContext.mods[file_path].action === 'create') {
      delete commitContext.mods[file_path]
    } else {
      commitContext.mods[file_path] = {
        action: 'delete',
      }
    }
  }

  async appendFile(commitContext: CommitContext, file_path: string, content: string) {
    let currContent: string
    if (commitContext.mods[file_path]) {
      // в случае если был deleteFile мы тоже должны зайти в эту ветку
      currContent = commitContext.mods[file_path].content || ''
    } else {
      // @TODO: передавать cwd явно
      currContent = getContents(process.cwd(), file_path) || ''
    }

    await this.updateFile(commitContext, file_path, currContent + content)
  }

  async commit(commitContext: CommitContext, message: string, opts: CommitOptions = {}): Promise<CommitResult> {
    const { branch } = opts

    commitContext.branch = branch
    commitContext.commit_message = message
    for (const [file_path, actionBody] of Object.entries(commitContext.mods)) {
      commitContext.actions.push({
        ...actionBody,
        file_path,
      })
    }
    commitContext.mods = Object.create(null)

    const { json } = await glapi(`/projects/${gitlabEnv.projectSlug}/repository/commits`, {
      body: commitContext,
      method: 'POST',
    })

    return json
  }

  async fetchLatestSha(refName: string): Promise<string> {
    const { json: commits } = await glapi(
      `/projects/${gitlabEnv.projectSlug}/repository/commits?per_page=1&ref_name=${encodeURIComponent(refName)}`
    )
    return commits.length ? commits[0].id : '0000000000000000000000000000000000000000'
  }

  async addTag(tag_name: string, ref: string, opts: AddTagOptions = {}) {
    const payload: Record<string, string> = {
      tag_name,
      ref,
    }
    if (opts.annotation) {
      payload.message = opts.annotation
    }
    const { json } = await createTag(gitlabEnv.projectId, payload)

    return json
  }

  async getCommitLink(commit: string) {
    return `${gitlabEnv.getProjectUrl(await getConfig())}/commit/${commit}`
  }

  getCurrentBranch(): string | undefined {
    return gitlabEnv.getBranchName(this.config.cwd)
  }

  getCommitSha(): string {
    return gitlabEnv.commitSha
  }

  private logReleaseTag(tagName: string): void {
    const { CI_PROJECT_NAMESPACE, CI_PROJECT_NAME } = env
    log(`release tag link: ${getGitlabHostUrl(this.config)}/${CI_PROJECT_NAMESPACE}/${CI_PROJECT_NAME}/tags/${tagName}`)
  }
}
