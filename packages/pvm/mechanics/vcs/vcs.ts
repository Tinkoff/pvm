import { logger } from '../../lib/logger'
import { wdShell } from '../../lib/shell'

import type {
  VcsOnly, UnknownCommitContext,
  AbstractVcs, AddTagOptions, CommitResult, PushOptions,
} from '../../types'
import type { PlatformInterface } from '../platform/platform-interface'
import type { GlobalFlags } from '../../lib/cli/global-flags'

export class VcsPlatform implements VcsOnly {
  readonly vcs: AbstractVcs<any>
  readonly cwd: string
  dryRun = false
  commitContext: any = null
  _isSomethingForCommit = false
  localMode = false
  vcsMode: 'vcs' | 'platform'
  vcsOrPlatform: PlatformInterface<any, any> | AbstractVcs<any>

  constructor(opts: {
    cwd: string,
    vcsMode?: 'vcs' | 'platform',
    vcs: AbstractVcs<any>,
    platform: PlatformInterface<any, any>,
    globalFlags: GlobalFlags,
  }) {
    const { cwd, vcsMode = 'vcs', vcs, platform, globalFlags } = opts

    this.cwd = cwd
    this.vcsMode = globalFlags.getFlag('localMode') ? 'vcs' : vcsMode
    this.vcs = vcs
    this.dryRun = globalFlags.getFlag('dryRun')
    this.localMode = globalFlags.getFlag('localMode')
    this.vcsOrPlatform = this.vcsMode === 'vcs' ? vcs : platform
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
    await this.vcsOrPlatform.rollbackCommit(commitContext)

    this.resetCommitContext()
  }

  beginCommit(): UnknownCommitContext {
    // FYI: upconf оперирует vcs без beginCommit
    // поэтому неявный контекст созданный в _prepareCommitContext возвращаем как есть
    if (!this.commitContext) {
      this.commitContext = this.vcsOrPlatform.beginCommit()
    }
    return this.commitContext
  }

  _prepareCommitContext(): UnknownCommitContext {
    this._isSomethingForCommit = true
    return this.beginCommit()
  }

  async addFiles(filePaths: string[]): Promise<unknown> {
    if (filePaths.length) {
      return this.vcsOrPlatform.addFiles(this._prepareCommitContext(), filePaths)
    }
  }

  async addPath(path: string): Promise<unknown> {
    const filePaths = this.gitShell(`git ls-files --cached --others "${path}"`).split('\n').filter(x => x.length !== 0)
    return await this.addFiles(filePaths)
  }

  async updateFile(filePath: string, content: string): Promise<unknown> {
    return this.vcsOrPlatform.updateFile(this._prepareCommitContext(), filePath, content)
  }

  async appendFile(filePath: string, content: string): Promise<unknown> {
    return this.vcsOrPlatform.appendFile(this._prepareCommitContext(), filePath, content)
  }

  async deleteFile(filePath: string): Promise<unknown> {
    return this.vcsOrPlatform.deleteFile(this._prepareCommitContext(), filePath)
  }

  async commit(message: string, opts = {}): Promise<CommitResult | undefined> {
    if (!this.isSomethingForCommit()) {
      logger.log('nothing to commit')
      return
    }

    const result = await this.vcsOrPlatform.commit(this.commitContext, message, opts)
    this.resetCommitContext()

    // нулевой айди не обязателен здесь, но всякий случай пусть будет
    return result || { id: '0000000000000000000000000000000000000000' }
  }

  async push(opts: PushOptions = {}): Promise<void> {
    if (this.vcsMode === 'vcs') {
      await this.vcs.push(opts)
    }
  }

  async addTag(tagName: string, ref: string, opts: AddTagOptions = {}): Promise<void> {
    await this.vcsOrPlatform.addTag(tagName, ref, opts)
  }

  async fetchLatestSha(refName: string): Promise<string> {
    return this.vcsOrPlatform.fetchLatestSha(refName)
  }

  async isRefMatchesRemoteBranch(targetRef = 'HEAD', branchName: string): Promise<boolean> {
    if (!branchName) {
      throw new Error(`Branch name is required. Are you in detached head state ?`)
    }
    return this.gitShell(`git rev-parse ${targetRef}`) === (await this.fetchLatestSha(branchName))
  }
}
