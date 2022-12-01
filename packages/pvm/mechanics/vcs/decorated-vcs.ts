import type { AbstractVcs, AddTagOptions, CommitOptions, CommitResult, PushOptions, PushError } from '../../types'
import type { GlobalFlags } from '../../lib/cli/global-flags'

import { logger } from '../../lib/logger'
import { logDryRun } from '../../lib/utils'

export class DecoratedVcs implements AbstractVcs<any> {
  dryRun: boolean
  protected vcs: AbstractVcs<any>
  protected localMode: boolean

  constructor({ vcs, globalFlags }: { vcs: AbstractVcs<any>, globalFlags: GlobalFlags}) {
    this.vcs = vcs
    this.dryRun = globalFlags.getFlag('dryRun')
    this.localMode = globalFlags.getFlag('localMode')
  }

  @logDryRun
  addFiles(commitContext: any, filePaths: string[]): void {
    if (this.dryRun) {
      return
    }

    return this.vcs.addFiles(commitContext, filePaths)
  }

  @logDryRun
  async addTag(tag_name: string, ref: string, opts: AddTagOptions): Promise<unknown> {
    if (this.dryRun) {
      return
    }

    return this.vcs.addTag(tag_name, ref, opts)
  }

  @logDryRun
  appendFile(commitContext: any, filePath: string, content: string): void {
    if (this.dryRun) {
      return
    }

    return this.vcs.appendFile(commitContext, filePath, content)
  }

  beginCommit(): any {
    return this.vcs.beginCommit()
  }

  commit(commitContext: any, message: string, opts?: CommitOptions): Promise<CommitResult> {
    if (this.dryRun) {
      return Promise.resolve({
        id: this.getHeadRev(),
      })
    }

    return this.vcs.commit(commitContext, message, opts)
  }

  @logDryRun
  deleteFile(commitContext: any, file_path: string): void {
    if (this.dryRun) {
      return
    }

    return this.vcs.deleteFile(commitContext, file_path)
  }

  fetchLatestSha(refName: string): Promise<string> {
    return this.vcs.fetchLatestSha(refName)
  }

  getCurrentBranch(): string | void {
    return this.vcs.getCurrentBranch()
  }

  getHeadRev(): string {
    return this.vcs.getHeadRev()
  }

  isLastAvailableRef(rev: string): boolean {
    return this.vcs.isLastAvailableRef(rev)
  }

  async push(opts?: PushOptions): Promise<void> {
    if (this.localMode) {
      return
    }

    try {
      if (this.dryRun) {
        logger.info('pushing changes in dry run mode')
      }

      return this.vcs.push({
        ...opts,
        dryRun: this.dryRun,
      })
    } catch (e) {
      (e as PushError).context = 'push'
      throw e
    }
  }

  @logDryRun
  async rollbackCommit(commitContext: any): Promise<void> {
    if (this.dryRun) {
      return
    }

    return this.vcs.rollbackCommit(commitContext)
  }

  @logDryRun
  updateFile(commitContext: any, file_path: string, content: string): void {
    if (this.dryRun) {
      return
    }

    return this.vcs.updateFile(commitContext, file_path, content)
  }
}
