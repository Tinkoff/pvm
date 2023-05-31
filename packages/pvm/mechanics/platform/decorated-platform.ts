import { PlatformInterface } from './platform-interface'
import type {
  AddTagOptions,
  CommitOptions,
  CommitResult, CreateReleasePayload,
  GetReleaseResult, MetaComment,
  PlatformReleaseTag,
  ReleasePayload,
  VcsRelease,
  AbstractVcs, HostApi,
} from '../../types'
import type { GlobalFlags } from '../../lib/cli/global-flags'
import { logDryRun } from '../../lib/utils'

export class DecoratedPlatform extends PlatformInterface<any, any> {
  protected platform: PlatformInterface<any, any>
  protected vcs: AbstractVcs<any>
  protected cwd: string
  protected hostApi: HostApi

  constructor({ platform, globalFlags, vcs, cwd, hostApi }: { platform: PlatformInterface<any, any>, globalFlags: GlobalFlags, vcs: AbstractVcs<any>, cwd: string, hostApi: HostApi }) {
    super({ name: platform.name, globalFlags })
    this.platform = platform
    this.vcs = vcs
    this.cwd = cwd
    this.hostApi = hostApi
    this.name = this.platform.name
  }

  @logDryRun
  async addTag(tag_name: string, ref: string, opts: AddTagOptions | undefined): Promise<unknown> {
    if (!this.dryRun && !this.localMode) {
      return this.platform.addTag(tag_name, ref, opts)
    }
  }

  @logDryRun
  addTagAndRelease(ref: string, tag_name: string, data: CreateReleasePayload): Promise<unknown> {
    if (this.dryRun) {
      return Promise.resolve()
    }

    if (!this.localMode) {
      return this.platform.addTagAndRelease(ref, tag_name, data)
    } else {
      return this.vcs.addTag(tag_name, ref, {
        annotation: data.annotation,
      })
    }
  }

  async beginMrAttribution(): Promise<void> {
    if (!this.localMode) {
      await this.platform.beginMrAttribution()
    }
  }

  @logDryRun
  async createMrNote(body: string): Promise<unknown> {
    if (!this.dryRun && !this.localMode) {
      return this.platform.createMrNote(body)
    }
  }

  @logDryRun
  async createProjectLabel(label: string, color: string): Promise<unknown> {
    if (!this.dryRun && !this.localMode) {
      return this.platform.createProjectLabel(label, color)
    }
  }

  @logDryRun
  async createRelease(tagName: string, payload: CreateReleasePayload): Promise<unknown> {
    if (!this.dryRun && !this.localMode) {
      return this.platform.createRelease(tagName, payload)
    }
  }

  @logDryRun
  async editRelease(tag_name: string, data: ReleasePayload): Promise<unknown> {
    if (!this.dryRun && !this.localMode) {
      return this.platform.editRelease(tag_name, data)
    }
  }

  @logDryRun
  async ensureMrLabels(labels: string[]): Promise<unknown> {
    if (!this.dryRun && !this.localMode) {
      return this.platform.ensureMrLabels(labels)
    }
  }

  fetchLatestSha(refName: string): Promise<string> {
    return this.platform.fetchLatestSha(refName)
  }

  findMrNote(kind: string): Promise<MetaComment<{ body: string, id: string | number }> | void> {
    return this.platform.findMrNote(kind)
  }

  getCommitLink(commit: string): Promise<string | null> {
    return this.platform.getCommitLink(commit)
  }

  getCommitSha(): string {
    return this.platform.getCommitSha()
  }

  getCurrentBranch(): string | undefined {
    return this.platform.getCurrentBranch()
  }

  getProjectLabels(): AsyncIterable<{ name: string }> {
    return this.platform.getProjectLabels()
  }

  getRelease(tagName: string): Promise<GetReleaseResult> {
    return this.platform.getRelease(tagName)
  }

  getUpdateHintsByCommit(commit: string): Promise<Record<string, any> | null> {
    return this.platform.getUpdateHintsByCommit(commit)
  }

  releaseTagsIterator(): AsyncGenerator<PlatformReleaseTag, void, any> {
    return this.platform.releaseTagsIterator()
  }

  releasesIterator(): AsyncGenerator<VcsRelease, void, any> {
    return this.platform.releasesIterator()
  }

  requireMr(): any {
    return this.platform.requireMr()
  }

  @logDryRun
  async setMrLabels(labels: string[]): Promise<unknown> {
    if (!this.dryRun && !this.localMode) {
      return this.platform.setMrLabels(labels)
    }
  }

  @logDryRun
  async syncAttachment(kind: string, attachment: Buffer, opts: any): Promise<unknown> {
    if (!this.dryRun && !this.localMode) {
      return this.platform.syncAttachment(kind, attachment, opts)
    }
  }

  @logDryRun
  async syncText(kind: string, text: string): Promise<unknown> {
    if (!this.dryRun && !this.localMode) {
      return this.platform.syncText(kind, text)
    }
  }

  @logDryRun
  async updateMrNote(commentId: number | string, body: string): Promise<unknown> {
    if (!this.dryRun && !this.localMode) {
      return this.platform.updateMrNote(commentId, body)
    }
  }

  @logDryRun
  async upsertRelease(tag_name: string, data: ReleasePayload): Promise<unknown> {
    if (!this.dryRun && !this.localMode) {
      return this.platform.upsertRelease(tag_name, data)
    }
  }

  @logDryRun
  addFiles(commitContext: any, filePaths: string[]): void {
    if (!this.dryRun && !this.localMode) {
      return this.platform.addFiles(commitContext, filePaths)
    }
  }

  @logDryRun
  appendFile(commitContext: any, filePath: string, content: string): void {
    if (!this.dryRun && !this.localMode) {
      return this.platform.appendFile(commitContext, filePath, content)
    }
  }

  beginCommit(): any {
    if (!this.localMode) {
      return this.platform.beginCommit()
    }
  }

  @logDryRun
  commit(commitContext: any, message: string, opts?: CommitOptions): Promise<CommitResult> {
    if (this.dryRun || this.localMode) {
      return Promise.resolve({
        id: this.vcs.getHeadRev(),
      })
    }

    return this.platform.commit(commitContext, message, opts)
  }

  @logDryRun
  deleteFile(commitContext: any, file_path: string): void {
    if (!this.dryRun && !this.localMode) {
      return this.platform.deleteFile(commitContext, file_path)
    }
  }

  rollbackCommit(commitContext: any): Promise<void> {
    return this.platform.rollbackCommit(commitContext)
  }

  @logDryRun
  updateFile(commitContext: any, file_path: string, content: string): void {
    if (!this.dryRun && !this.localMode) {
      return this.platform.updateFile(commitContext, file_path, content)
    }
  }
}
