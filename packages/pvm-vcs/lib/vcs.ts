import hostedGitInfo from 'hosted-git-info'

import { getConfig } from '@pvm/core/lib/config'
import { inspectArgs } from '@pvm/core/lib/inspect-args'
import { logger } from '@pvm/core/lib/logger'
import { wdShell } from '@pvm/core/lib/shell'
import type { HostApi } from '@pvm/core/lib/plugins'
import { getHostApi } from '@pvm/core/lib/plugins'
import { cachedRealPath } from '@pvm/core/lib/fs'
import { initFsVcs } from '@pvm/vcs-fs'
import { initGitVcs } from '@pvm/vcs-git/lib/git-vcs'

import type { GitCommitContext } from '@pvm/vcs-git/lib/git-vcs'
import type {
  ReleasePayload, CreateReleasePayload, VcsRelease, VcsOnly, UnknownCommitContext,
  AbstractVcs, AddTagOptions, CommitResult, GetReleaseResult, PushOptions, PlatformReleaseTag,
} from '../types'
import { env } from '@pvm/core/lib/env'
import { mema } from '@pvm/core/lib/memoize'

const VcsMap = {
  git: initGitVcs,
  fs: initFsVcs,
}

function detectPlatformType(cwd: string): string {
  if (env.PVM_PLATFORM_TYPE) {
    return env.PVM_PLATFORM_TYPE
  }

  if (env.GITLAB_CI) {
    return 'gitlab'
  }

  if (env.GITHUB_REPOSITORY) {
    return 'github'
  }

  const repoUrl = wdShell(cwd, 'git remote get-url origin')
  const info = hostedGitInfo.fromUrl(repoUrl)

  if (info && info.type) {
    return info.type
  }

  if (repoUrl.indexOf('gitlab') !== -1) {
    return 'gitlab'
  }

  return 'unknown'
}

function detectVcsType() {
  return env.PVM_VCS_TYPE || 'git'
}

async function loadBuiltinVcs(cwd: string, customVcsType?: string): Promise<void> {
  const config = await getConfig(cwd)
  const vcsType = customVcsType || (config.vcs.builtin_type === 'auto' ? detectVcsType() : config.vcs.builtin_type)

  if (!VcsMap[vcsType]) {
    throw new Error(`Unsupported vcs "${vcsType}"`)
  }

  const hostApi = await getHostApi(cwd)
  hostApi.provideRecord('vcs', VcsMap[vcsType](cwd))
}

const getPlatforms = mema(async function getPlatformsRaw() {
  const gitlabPlatform = (await (import('@pvm/gitlab/lib/platform').catch(() => {
    logger.info('@pvm/gitlab not installed. Gitlab platform support is disabled')
    return {
      GitlabPlatform: undefined,
    }
  }))).GitlabPlatform

  const githubPlatform = (await (import('@pvm/github').catch(() => {
    logger.info('@pvm/github not installed. Github platform support is disabled')
    return {
      GithubPlatform: undefined,
    }
  }))).GithubPlatform

  return {
    gitlab: gitlabPlatform,
    github: githubPlatform,
  }
})

async function loadBuiltinPlatform(cwd: string): Promise<void> {
  const platforms = await getPlatforms()
  const platformType = detectPlatformType(cwd)

  if (!platforms[platformType]) {
    // если нет платформы ничего страшного, возможно она и не понадобится вообще
    return
  }

  const hostApi = await getHostApi(cwd)
  const config = await getConfig(cwd)

  hostApi.provideClass('platform', new platforms[platformType](config))
}

function dryRunStub(method: string, ...args: any[]): void {
  logger.debug(`DRY RUN: ${method}`, `(${inspectArgs(args)})`)
}

export interface PushError extends Error {
  context: 'push',
}

const dryRunHostApi: HostApi = {
  run: dryRunStub,
  runOr: dryRunStub,
  plPipe: dryRunStub,
  plEachSeries: dryRunStub,
} as HostApi

interface VcsConstructorOpts {
  cwd?: string,
  vcsMode?: 'vcs' | 'platform',
}

// @TODO: wrong abstraction for fs/vcs tuple
// надо либо выделить отдельный слой для vcs-файловых операций
// либо fs просто убить, и взамен него использовать local mode для любой vcs, что скорее всего предпочтительней
export class VcsPlatform implements VcsOnly {
  cwd: string
  isDryRun = false
  hostApi: HostApi
  mutHostApi: HostApi
  commitContext: any = null
  _isSomethingForCommit = false
  _localMode = false
  vcsMode: 'vcs' | 'platform'
  gitVcs: AbstractVcs<GitCommitContext>

  constructor(hostApi, opts: VcsConstructorOpts = {}) {
    const { cwd = process.cwd(), vcsMode = 'vcs' } = opts
    this.hostApi = hostApi
    this.mutHostApi = hostApi
    this.cwd = cwd
    this.vcsMode = vcsMode
    this.gitVcs = initGitVcs(cwd)
  }

  dryRun() {
    this.isDryRun = true
    this.hostApi.run('vcs.dryRun')
    this.mutHostApi = dryRunHostApi
  }

  // в этом режиме никакие пуши или общения с gitlab api запрещены
  // при этом работа с локальным git или fs разрешена
  setLocalMode(): void {
    logger.log('enable local mode for VCS')
    this.vcsMode = 'vcs'
    this._localMode = true
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
    await this.hostApi.run(`${this.vcsMode}.rollbackCommit`, commitContext)

    this.resetCommitContext()
  }

  beginCommit(): UnknownCommitContext {
    // FYI: upconf оперирует vcs без beginCommit
    // поэтому неявный контекст созданный в _prepareCommitContext возвращаем как есть
    if (!this.commitContext) {
      this.commitContext = this.hostApi.run(`${this.vcsMode}.beginCommit`)
    }
    return this.commitContext
  }

  _prepareCommitContext(): UnknownCommitContext {
    this._isSomethingForCommit = true
    return this.beginCommit()
  }

  async addFiles(filePaths: string[]): Promise<unknown> {
    if (filePaths.length) {
      return this.mutHostApi.run(`${this.vcsMode}.addFiles`, this._prepareCommitContext(), filePaths)
    }
  }

  async addPath(path: string): Promise<unknown> {
    const filePaths = this.gitShell(`git ls-files --cached --others "${path}"`).split('\n').filter(x => x.length !== 0)
    return await this.addFiles(filePaths)
  }

  async updateFile(filePath: string, content: string): Promise<unknown> {
    return this.mutHostApi.run(`${this.vcsMode}.updateFile`, this._prepareCommitContext(), filePath, content)
  }

  async appendFile(filePath: string, content: string): Promise<unknown> {
    return this.mutHostApi.run(`${this.vcsMode}.appendFile`, this._prepareCommitContext(), filePath, content)
  }

  async deleteFile(filePath: string): Promise<unknown> {
    return this.mutHostApi.run(`${this.vcsMode}.deleteFile`, this._prepareCommitContext(), filePath)
  }

  async commit(message: string, opts = {}): Promise<CommitResult | undefined> {
    if (!this.isSomethingForCommit()) {
      logger.log('nothing to commit')
      return
    }
    // vcs-провайдеры сами обслуживают dry-run режим
    const commitHostApi = this.vcsMode === 'vcs' ? this.hostApi : this.mutHostApi

    const result = await commitHostApi.run(`${this.vcsMode}.commit`, this.commitContext, message, opts)
    this.resetCommitContext()

    // если у нас замокан commitHostApi возвращаем просто текущий коммит
    if (this.isDryRun && commitHostApi === this.mutHostApi) {
      return { id: this.gitVcs.getHeadRev() }
    }

    // нулевой айди не обязателен здесь, но всякий случай пусть будет
    return result || { id: '0000000000000000000000000000000000000000' }
  }

  async push(opts: PushOptions = {}): Promise<void> {
    if (this.vcsMode === 'vcs' && !this._localMode) {
      // в данном случае не подменяем на mutHostApi, который в случае dryRun просто пустышка-логгер
      // т.к. конечные vcs сами должны учитывать вызов метода vcs.dryRun для последующих вызовов vcs.push
      try {
        await this.hostApi.run('vcs.push', opts)
      } catch (e) {
        (e as PushError).context = 'push'
        throw e
      }
    }
  }

  getCurrentBranch(): string | undefined {
    return this.hostApi.run(`platform.getCurrentBranch`)
  }

  isLastAvailableRef(ref: string): boolean {
    return this.hostApi.run('vcs.isLastAvailableRef', ref)
  }

  async addTag(tagName: string, ref: string, opts: AddTagOptions = {}): Promise<void> {
    await this.mutHostApi.run(`${this.vcsMode}.addTag`, tagName, ref, opts)
  }

  async createRelease(tagName: string, data: ReleasePayload): Promise<void> {
    if (!this._localMode) {
      return this.mutHostApi.run('platform.createRelease', tagName, data)
    }
  }

  async addTagAndRelease(ref: string, tagName: string, data: CreateReleasePayload): Promise<void> {
    if (!this._localMode) {
      await this.mutHostApi.run('platform.addTagAndRelease', ref, tagName, data)
    } else {
      await this.addTag(tagName, ref, {
        annotation: data.annotation,
      })
    }
  }

  async editRelease(tagName: string, data: ReleasePayload): Promise<void> {
    if (!this._localMode) {
      await this.mutHostApi.run('platform.editRelease', tagName, data)
    }
  }

  // редактирует релиз если он есть, либо создает новый если его нет
  // тег обязан существовать
  async upsertRelease(tagName: string, data: ReleasePayload): Promise<void> {
    if (!this._localMode) {
      await this.mutHostApi.run('platform.upsertRelease', tagName, data)
    }
  }

  async getRelease(tagName: string): Promise<GetReleaseResult> {
    return this.hostApi.run('platform.getRelease', tagName)
  }

  releasesIterator(): AsyncIterable<VcsRelease> {
    return this.hostApi.run('platform.releasesIterator')
  }

  releaseTagsIterator(): AsyncIterable<PlatformReleaseTag> {
    return this.hostApi.run('platform.releaseTagsIterator')
  }

  async fetchLatestSha(refName: string): Promise<string> {
    return this.hostApi.run(`${this.vcsMode}.fetchLatestSha`, refName)
  }

  async syncText(kind: string, text: string): Promise<unknown> {
    if (!this._localMode) {
      return this.mutHostApi.run('platform.syncText', kind, text)
    }
  }

  async syncAttachment(kind: string, attachment: Buffer, opts = {}): Promise<unknown> {
    if (!this._localMode) {
      return this.mutHostApi.run('platform.syncAttachment', kind, attachment, opts)
    }
  }

  async beginMrAttribution(): Promise<unknown> {
    if (!this._localMode) {
      return this.hostApi.run('platform.beginMrAttribution')
    }
  }

  async ensureMrLabels(labels: string[]): Promise<unknown> {
    if (!this._localMode) {
      return this.mutHostApi.run('platform.ensureMrLabels', labels)
    }
  }

  async isRefMatchesRemoteBranch(targetRef = 'HEAD', branchName: string): Promise<boolean> {
    if (!branchName) {
      throw new Error(`Branch name is required. Are you in detached head state ?`)
    }
    return this.gitShell(`git rev-parse ${targetRef}`) === await this.fetchLatestSha(branchName)
  }

  async getCommitLink(commit: string): Promise<string | null> {
    return this.hostApi.run('platform.getCommitLink', commit)
  }
}

interface InitVcsOpts {
  cwd?: string,
  dryRun?: boolean,
  vcsType?: keyof typeof VcsMap,
  vcsMode?: 'vcs' | 'platform',
  localMode?: boolean,
}

const vcsInstances = new Map<string, VcsPlatform>()

async function initVcsPlatform(opts: InitVcsOpts = {}): Promise<VcsPlatform> {
  const { cwd = process.cwd(), dryRun, vcsType, localMode = global.argv?.local || false, vcsMode } = opts
  await loadBuiltinVcs(cwd, vcsType)
  const useLocalMode = localMode || env.PVM_EXTERNAL_DRY_RUN

  // платформа может понадобится и в локальном режиме
  await loadBuiltinPlatform(cwd)
  const hostApi = await getHostApi(cwd)

  const vcs = new VcsPlatform(hostApi, {
    cwd,
    vcsMode,
  })
  if (dryRun) {
    vcs.dryRun()
  }

  if (useLocalMode) {
    vcs.setLocalMode()
  }

  const cacheKey = cachedRealPath(cwd)
  vcsInstances.set(cacheKey, vcs)
  return vcs
}

async function lazyInitVcs(cwd: string, opts: Omit<InitVcsOpts, 'cwd'> = {}): Promise<VcsPlatform> {
  const vcs = vcsInstances.get(cachedRealPath(cwd))
  if (!vcs) {
    return await initVcsPlatform({
      cwd,
      ...opts,
    })
  }
  return vcs
}

export {
  initVcsPlatform,
  lazyInitVcs,
  initVcsPlatform as default,
  VcsPlatform as Vcs, // для обратной совместимости
}
