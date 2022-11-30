import { log, logger } from '../../lib/logger'
import { wdShell } from '../../lib/shell'

import type {
  ReleasePayload, CreateReleasePayload, VcsRelease, VcsOnly, UnknownCommitContext,
  AbstractVcs, AddTagOptions, CommitResult, GetReleaseResult, PushOptions, PlatformReleaseTag,
  AlterReleaseResult,
} from './types'
import type { PlatformInterface, PlatformInterfaceWithFileCommitApi } from './platform-interface'
import type { GlobalFlags } from '../../lib/cli/global-flags'
import type { HostApi } from '../../types/host-api'
import getCommits from '../../lib/git/commits'
import { PlatformResult } from '../../lib/shared'

export interface PushError extends Error {
  context: 'push',
}

export interface VcsConstructorOpts {
  cwd: string,
  vcsMode?: 'vcs' | 'platform',
  vcs: AbstractVcs<any>,
  platform: PlatformInterface<any> | PlatformInterfaceWithFileCommitApi<any, any>,
  hostApi: HostApi,
  globalFlags: GlobalFlags,
}

type TargetVcs = AbstractVcs<any> | PlatformInterface<any> | PlatformInterfaceWithFileCommitApi<any, any>
type TargetVcsIntersection = AbstractVcs<any> & PlatformInterface<any> & PlatformInterfaceWithFileCommitApi<any, any>

export class VcsPlatform implements VcsOnly {
  readonly hostApi: HostApi
  mutHostApi: HostApi
  readonly platform: PlatformInterface<any> | PlatformInterfaceWithFileCommitApi<any, any>
  readonly vcs: AbstractVcs<any>
  readonly cwd: string
  isDryRun = false
  commitContext: any = null
  _isSomethingForCommit = false
  isLocalMode = false
  vcsMode: 'vcs' | 'platform'

  constructor(opts: VcsConstructorOpts) {
    const { cwd, vcsMode = 'vcs', hostApi, vcs, platform, globalFlags } = opts

    this.hostApi = hostApi
    this.mutHostApi = hostApi
    this.platform = platform
    this.cwd = cwd
    this.vcsMode = globalFlags.getFlag('localMode') ? 'vcs' : vcsMode
    this.vcs = vcs
    this.isDryRun = globalFlags.getFlag('dryRun')
    this.isLocalMode = globalFlags.getFlag('localMode')
  }

  setVcsMode(vcsMode: 'vcs' | 'platform'): void {
    this.vcsMode = vcsMode
  }

  get targetVcs(): TargetVcs {
    return this.vcsMode === 'vcs' ? this.vcs : this.platform
  }

  // eslint-disable-next-line @typescript-eslint/ban-types
  invokeTargetVcsMethod<M extends keyof { [P in keyof TargetVcsIntersection]: TargetVcsIntersection[P] extends Function ? TargetVcsIntersection[P] : never }>(method: M, ...args: Parameters<TargetVcsIntersection[M]>): ReturnType<TargetVcsIntersection[M]> {
    if (method in this.targetVcs) {
      return (this.targetVcs as TargetVcsIntersection)[method](...args)
    } else {
      throw new Error(`Method "${method}" not found in target vcs. Selected "vcsMode" is "${this.vcsMode}"`)
    }
  }

  gitShell(cmd: string, opts = {}): string {
    return wdShell(this.cwd, cmd, opts)
  }

  isSomethingForCommit(): boolean {
    return this._isSomethingForCommit
  }

  resetCommitContext(): void {
    this.commitContext = null
    this._isSomethingForCommit = false
  }

  async rollbackCommit(commitContext: UnknownCommitContext): Promise<void> {
    await this.invokeTargetVcsMethod('rollbackCommit', commitContext)

    this.resetCommitContext()
  }

  beginCommit(): UnknownCommitContext {
    // FYI: upconf оперирует vcs без beginCommit
    // поэтому неявный контекст созданный в _prepareCommitContext возвращаем как есть
    if (!this.commitContext) {
      this.commitContext = this.invokeTargetVcsMethod('beginCommit')
    }
    return this.commitContext
  }

  _prepareCommitContext(): UnknownCommitContext {
    this._isSomethingForCommit = true
    return this.beginCommit()
  }

  async addFiles(filePaths: string[]): Promise<unknown> {
    if (filePaths.length) {
      return this.invokeTargetVcsMethod(`addFiles`, this._prepareCommitContext(), filePaths)
    }
  }

  async addPath(path: string): Promise<unknown> {
    const filePaths = this.gitShell(`git ls-files --cached --others "${path}"`).split('\n').filter(x => x.length !== 0)
    return await this.addFiles(filePaths)
  }

  async updateFile(filePath: string, content: string): Promise<unknown> {
    return this.invokeTargetVcsMethod(`updateFile`, this._prepareCommitContext(), filePath, content)
  }

  async appendFile(filePath: string, content: string): Promise<unknown> {
    return this.invokeTargetVcsMethod(`appendFile`, this._prepareCommitContext(), filePath, content)
  }

  async deleteFile(filePath: string): Promise<unknown> {
    return this.invokeTargetVcsMethod(`deleteFile`, this._prepareCommitContext(), filePath)
  }

  async commit(message: string, opts = {}): Promise<CommitResult | undefined> {
    if (!this.isSomethingForCommit()) {
      logger.log('nothing to commit')
      return
    }

    const result = await this.invokeTargetVcsMethod(`commit`, this.commitContext, message, opts)
    this.resetCommitContext()

    // если у нас замокан commitHostApi возвращаем просто текущий коммит
    if (this.isDryRun && !result) {
      return { id: this.vcs.getHeadRev() }
    }

    // нулевой айди не обязателен здесь, но всякий случай пусть будет
    return result || { id: '0000000000000000000000000000000000000000' }
  }

  async push(opts: PushOptions = {}): Promise<void> {
    if (this.vcsMode === 'vcs' && !this.isLocalMode) {
      // в данном случае не подменяем на mutHostApi, который в случае dryRun просто пустышка-логгер
      // т.к. конечные vcs сами должны учитывать вызов метода vcs.dryRun для последующих вызовов vcs.push
      try {
        await this.invokeTargetVcsMethod(`push`, opts)
      } catch (e) {
        (e as PushError).context = 'push'
        throw e
      }
    }
  }

  getCurrentBranch(): string | undefined {
    return this.platform.getCurrentBranch()
  }

  isLastAvailableRef(ref: string): boolean {
    return this.vcs.isLastAvailableRef(ref)
  }

  async addTag(tagName: string, ref: string, opts: AddTagOptions = {}): Promise<void> {
    await this.invokeTargetVcsMethod(`addTag`, tagName, ref, opts)
  }

  async createRelease(tagName: string, data: ReleasePayload): Promise<AlterReleaseResult | void> {
    if (!this.isLocalMode) {
      return this.platform.createRelease(tagName, data)
    }
  }

  async addTagAndRelease(ref: string, tagName: string, data: CreateReleasePayload): Promise<void> {
    if (!this.isLocalMode) {
      await this.platform.addTagAndRelease(ref, tagName, data)
    } else {
      await this.addTag(tagName, ref, {
        annotation: data.annotation,
      })
    }
  }

  async editRelease(tagName: string, data: ReleasePayload): Promise<void> {
    if (!this.isLocalMode) {
      await this.platform.editRelease(tagName, data)
    }
  }

  // редактирует релиз если он есть, либо создает новый если его нет
  // тег обязан существовать
  async upsertRelease(tagName: string, data: ReleasePayload): Promise<void> {
    if (!this.isLocalMode) {
      await this.platform.upsertRelease(tagName, data)
    }
  }

  async getRelease(tagName: string): Promise<GetReleaseResult> {
    return this.platform.getRelease(tagName)
  }

  releasesIterator(): AsyncIterable<VcsRelease> {
    return this.platform.releasesIterator()
  }

  releaseTagsIterator(): AsyncIterable<PlatformReleaseTag> {
    return this.platform.releaseTagsIterator()
  }

  async fetchLatestSha(refName: string): Promise<string> {
    return this.invokeTargetVcsMethod(`fetchLatestSha`, refName)
  }

  async syncText(kind: string, text: string): Promise<unknown> {
    if (!this.isLocalMode) {
      return this.platform.syncText(kind, text)
    }
  }

  async syncAttachment(kind: string, attachment: Buffer, opts = {}): Promise<unknown> {
    if (!this.isLocalMode) {
      return this.platform.syncAttachment(kind, attachment, opts)
    }
  }

  async beginMrAttribution(): Promise<unknown> {
    if (!this.isLocalMode) {
      return this.platform.beginMrAttribution()
    }
  }

  async ensureMrLabels(labels: string[]): Promise<unknown> {
    if (!this.isLocalMode) {
      return this.platform.ensureMrLabels(labels)
    }
  }

  async isRefMatchesRemoteBranch(targetRef = 'HEAD', branchName: string): Promise<boolean> {
    if (!branchName) {
      throw new Error(`Branch name is required. Are you in detached head state ?`)
    }
    return this.gitShell(`git rev-parse ${targetRef}`) === (await this.fetchLatestSha(branchName))
  }

  async getCommitLink(commit: string): Promise<string | null> {
    return this.platform.getCommitLink(commit)
  }

  async getUpdateHintsByCommit(commit: string): Promise<Record<string, any> | null> {
    if (!this.isLocalMode) {
      return this.platform.getUpdateHintsByCommit(commit)
    }

    return null
  }

  async prepareReleaseData(targetTag: string, prevRef: string): Promise<ReleasePayload> {
    log(`making release for ${targetTag} tag`)
    const commits = await getCommits(this.cwd, prevRef, targetTag)

    log(`generating release notes from commits ${prevRef}..${targetTag}`)
    const releaseNotes = await this.hostApi.commitsToNotes(commits)

    return {
      name: targetTag,
      description: releaseNotes,
    }
  }

  async makeReleaseForTag(tagObject, prevRef: string): Promise<void> {
    const releaseData = await this.prepareReleaseData(tagObject.name, prevRef)

    // цель: обновить у существующего тега/релиза description в не зависимости от наличия релиза
    await this.upsertRelease(tagObject.name, releaseData)

    log(`release notes for ${tagObject.name} have written successfully`)
  }

  // тег должен существовать
  async makeReleaseForTagName(tagName: string, prevRef: string, opts: {
    skipIfExists?: boolean,
  } = {}): Promise<void> {
    const { skipIfExists = false } = opts
    const releaseData = await this.prepareReleaseData(tagName, prevRef)

    const [responseCode, maybeRelease] = await this.getRelease(tagName)

    if (responseCode === PlatformResult.OK) {
      if (!maybeRelease!.description || !skipIfExists) {
        await this.editRelease(tagName, releaseData)
      } else {
        log(`release notes for ${tagName} already exists, skipping`)
        return
      }
    } else if (responseCode === PlatformResult.NOT_FOUND) { // тег есть, но нет релиза
      await this.createRelease(tagName, releaseData)
    } else if (responseCode === PlatformResult.NO_SUCH_TAG) {
      throw new Error(`Couldn't write release notes for tag "${tagName}". It doesn't exist.`)
    }

    log(`release notes for ${tagName} have written successfully`)
  }
}

export const Vcs = VcsPlatform
