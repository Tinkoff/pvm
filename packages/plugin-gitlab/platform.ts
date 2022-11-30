import fs from 'fs'
import { Lexer } from 'marked'
import * as TOML from '@iarna/toml'
import {
  cwdShell, getContents, PlatformResult,
  PlatformInterfaceWithFileCommitApi,
  env,
  log, CONFIG_TOKEN, GLOBAL_FLAGS_TOKEN, CWD_TOKEN,
} from '@pvm/pvm'
import type {
  AddTagOptions,
  CommitResult,
  GetReleaseResult,
  CommitOptions, MetaComment,
  Config,

  Container,
} from '@pvm/pvm'

import { releasesIterator, updateRelease, createRelease, upsertRelease, addTagAndRelease } from './lib/api/releases'
import { releaseTags } from './lib/api/tags/tags'
import getTag from './lib/api/tags/get'
import createTag from './lib/api/tags/create'

import type { SyncAttachmentOpts } from './lib/hal/mark-pr'
import { syncAttachment, findNote } from './lib/hal/mark-pr'
import { findOpenSingleMr } from './lib/hal/merge-request'

import gitlabEnv from './lib/env'
import glapi from './lib/api'

import type { MergeRequest } from './lib/api/mr/types'

import type { AlterReleaseResult } from './lib/api/releases/types'
import createLabel from './lib/api/labels/create'
import getLabels from './lib/api/labels/labels'
import updateMr from './lib/api/mr/update'
import { getGitlabHostUrl } from './lib/remote-url'
import { dryRun } from '@pvm/pvm/lib/utils'

const PVM_UPDATE_HINTS_KIND = 'pvm-update-hints'

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
  protected config: Config;
  protected di: Container
  protected cwd: string

  constructor({ di }: { di: Container }) {
    super()

    this.config = di.get(CONFIG_TOKEN)
    this.dryRun = di.get(GLOBAL_FLAGS_TOKEN).getFlag('dryRun')
    this.cwd = di.get(CWD_TOKEN)
    this.di = di
  }

  @dryRun
  setMrLabels(labels: string[]): Promise<unknown> {
    const iid = this.requireMr().iid

    return updateMr(this.di, gitlabEnv.projectId, iid, {
      labels: labels.join(','),
    })
  }

  getProjectLabels(): AsyncIterable<{ name: string }> {
    return getLabels(this.di, gitlabEnv.projectId)
  }

  @dryRun
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
    return await findNote(this.di, iid, kind)
  }

  async createMrNote(body: string): Promise<void> {
    const iid = this.requireMr().iid

    await glapi(this.di, `/projects/${gitlabEnv.projectSlug}/merge_requests/${iid}/notes`, {
      method: 'POST',
      body: {
        body,
      },
    })
  }

  @dryRun
  async updateMrNote(commentId: number, body: string): Promise<void> {
    const iid = this.requireMr().iid

    await glapi(this.di, `/projects/${gitlabEnv.projectSlug}/merge_requests/${iid}/notes/${commentId}`, {
      method: 'PUT',
      body: {
        body,
      },
    })
  }

  async getRelease(tagName: string): Promise<GetReleaseResult> {
    try {
      const { json } = await getTag(this.di, gitlabEnv.projectId, tagName)
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
    return releasesIterator(this.config, gitlabEnv.projectId)
  }

  releaseTagsIterator() {
    return releaseTags(this.config, gitlabEnv.projectId)
  }

  requireMr(): MergeRequest {
    const { currentMr } = this
    if (!currentMr) {
      throw new Error('current merge request not defined, forgot to call beginMrAttribution ?')
    }
    return currentMr
  }

  async beginMrAttribution() {
    this.currentMr = await findOpenSingleMr(this.di, this.getCurrentBranch())
  }

  @dryRun
  async addTagAndRelease(ref: string, tag_name: string, data): Promise<AlterReleaseResult> {
    const res = await addTagAndRelease(this.di, gitlabEnv.projectId, ref, {
      ...data, // name and description
      tag_name,
    })

    this.logReleaseTag(tag_name)

    return res
  }

  @dryRun
  async createRelease(tag_name: string, data): Promise<AlterReleaseResult> {
    const res = await createRelease(this.di, gitlabEnv.projectId, {
      ...data, // name and description
      tag_name,
    })

    this.logReleaseTag(tag_name)

    return res
  }

  @dryRun
  async editRelease(tag_name, data): Promise<AlterReleaseResult> {
    return await updateRelease(this.di, gitlabEnv.projectId, {
      ...data,
      tag_name,
    })
  }

  @dryRun
  async upsertRelease(tagName: string, data): Promise<AlterReleaseResult> {
    const res = await upsertRelease(this.di, gitlabEnv.projectId, {
      ...data,
      tag_name: tagName,
    })

    this.logReleaseTag(tagName)

    return res
  }

  @dryRun
  syncAttachment(kind: string, attachment: Buffer, opts: SyncAttachmentOpts = {}) {
    return syncAttachment(this.di, this.requireMr().iid, kind, attachment, opts)
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

  @dryRun
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

  @dryRun
  async updateFile(commitContext: CommitContext, file_path: string, content: string) {
    commitContext.mods[file_path] = {
      action: isFileInitiallyExists(file_path) ? 'update' : 'create',
      content,
    }
  }

  @dryRun
  async deleteFile(commitContext: CommitContext, file_path: string) {
    if (file_path in commitContext.mods && commitContext.mods[file_path].action === 'create') {
      delete commitContext.mods[file_path]
    } else {
      commitContext.mods[file_path] = {
        action: 'delete',
      }
    }
  }

  @dryRun
  async appendFile(commitContext: CommitContext, file_path: string, content: string) {
    let currContent: string
    if (commitContext.mods[file_path]) {
      // в случае если был deleteFile мы тоже должны зайти в эту ветку
      currContent = commitContext.mods[file_path].content || ''
    } else {
      // @TODO: передавать cwd явно
      currContent = getContents(this.cwd, file_path) || ''
    }

    await this.updateFile(commitContext, file_path, currContent + content)
  }

  @dryRun
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

    const { json } = await glapi(this.di, `/projects/${gitlabEnv.projectSlug}/repository/commits`, {
      body: commitContext,
      method: 'POST',
    })

    return json
  }

  async fetchLatestSha(refName: string): Promise<string> {
    const { json: commits } = await glapi(this.di,
      `/projects/${gitlabEnv.projectSlug}/repository/commits?per_page=1&ref_name=${encodeURIComponent(refName)}`
    )
    return commits.length ? commits[0].id : '0000000000000000000000000000000000000000'
  }

  @dryRun
  async addTag(tag_name: string, ref: string, opts: AddTagOptions = {}) {
    const payload: Record<string, string> = {
      tag_name,
      ref,
    }
    if (opts.annotation) {
      payload.message = opts.annotation
    }
    const { json } = await createTag(this.di, gitlabEnv.projectId, payload)

    return json
  }

  async getCommitLink(commit: string) {
    return `${gitlabEnv.getProjectUrl(this.config)}/commit/${commit}`
  }

  getCurrentBranch(): string | undefined {
    return gitlabEnv.getBranchName(this.config.cwd)
  }

  getCommitSha(): string {
    return gitlabEnv.commitSha
  }

  async getUpdateHintsByCommit(commit: string): Promise<Record<string, any> | null> {
    const currentBranch = this.getCurrentBranch()

    log(`Searching for update hints in merge request for commit ${commit}`)

    // first try to find open mr for branch. Then commit will be not needed.
    let processedMr
    try {
      processedMr = await findOpenSingleMr(this.di, currentBranch)
    } catch (e) {
      log('Opened mr not found. Moving on to search in merged merge requests')
      log(e)
    }
    // if not, then search by commit in all merged merge requests
    if (!processedMr) {
      const { json: mrs }: { json: Array<MergeRequest> } = await glapi(this.di, `/projects/${gitlabEnv.projectId}/repository/commits/${commit}/merge_requests`)

      processedMr = mrs.find(mr => mr.state === 'merged' && mr.target_branch === currentBranch)

      if (!processedMr) {
        log(`no mr for given commit found`)
        return null
      }
    }

    const description = processedMr.description

    if (!description) {
      log(`mr description is empty`)
      return null
    }

    log(`Analyzing description of merge request ${processedMr.web_url}`)

    return GitlabPlatform.getPvmUpdateHintsFromString(description)
  }

  static getPvmUpdateHintsFromString(text: string): Record<string, any> | null {
    let parsedDescription
    try {
      const lexer = new Lexer()
      parsedDescription = lexer.lex(text)
    } catch (e) {
      log(`Failed to parse MR description`)
      log(e)
      return null
    }

    const tomlCodeBlocks = parsedDescription.filter(block => block.type === 'code' && block.lang === 'toml')
    if (!tomlCodeBlocks.length) {
      log(`toml code not found in mr description`)
      return null
    }

    for (const block of tomlCodeBlocks) {
      try {
        const parsed = TOML.parse(block.text) as any
        if (parsed.kind === PVM_UPDATE_HINTS_KIND) {
          delete parsed.kind
          return parsed
        }
      } catch (e) {
        log(`Failed to parse toml code block`)
        log(block.text)
        log(e)
        break
      }
    }

    return null
  }

  private logReleaseTag(tagName: string): void {
    const { CI_PROJECT_NAMESPACE, CI_PROJECT_NAME } = env
    log(`release tag link: ${getGitlabHostUrl(this.config)}/${CI_PROJECT_NAMESPACE}/${CI_PROJECT_NAME}/tags/${tagName}`)
  }
}
