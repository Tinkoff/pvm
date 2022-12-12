import path from 'path'
import fse from 'fs-extra'
import tempy from 'tempy'
import runShell from '../../../lib/shell/run'
import { GitVcs, prepareGit } from '../../vcs/git-vcs'
import { gitFetch, isBranchExists, isRemoteBranchExists, isWorkingDirectoryClean } from '../../../lib/git/commands'

import { loggerFor } from '../../../lib/logger'

import type { StorageImpl } from '../storage.h'
import type { Config } from '../../../types/config'
import { RESOLVE_PUSH_REMOTE_TOKEN, CONFIG_TOKEN, GLOBAL_FLAGS_TOKEN, CWD_TOKEN } from '../../../tokens'
import type { GlobalFlags } from '../../../lib/cli/global-flags'
import type { Container } from '../../../lib/di'

const logger = loggerFor('pvm:artifacts')

export interface GitBranchStorageOpts {
  branch: string,
  cwd: string,
  config: Config,
  resolvePushRemote: typeof RESOLVE_PUSH_REMOTE_TOKEN,
  globalFlags: GlobalFlags,
}

export class GitBranchStorage implements StorageImpl {
  branch: string
  cwd: string
  _workingDir: string | undefined
  gitPrepared = false
  config: Config
  resolvePushRemote: typeof RESOLVE_PUSH_REMOTE_TOKEN | null
  globalFlags: GlobalFlags

  constructor({ di, branch }: { di: Container, branch: string }) {
    this.config = di.get(CONFIG_TOKEN)
    this.resolvePushRemote = di.get({ token: RESOLVE_PUSH_REMOTE_TOKEN, optional: true })
    this.globalFlags = di.get(GLOBAL_FLAGS_TOKEN)
    this.cwd = di.get(CWD_TOKEN)
    this.branch = branch
  }

  get workingDir(): string {
    if (!this._workingDir) {
      throw new Error('init should be called before accessing to workingDir')
    }

    return this._workingDir
  }

  private prepareGit(): void {
    if (!this.gitPrepared) {
      prepareGit(this.cwd)
    }

    this.gitPrepared = true
  }

  protected async runShell(cmd: string): Promise<void> {
    this.prepareGit()
    await runShell(cmd, { cwd: this.cwd })
  }

  protected async branchShell(cmd: string): Promise<void> {
    this.prepareGit()
    await runShell(cmd, { cwd: this.workingDir })
  }

  async init(): Promise<void> {
    const workingDir = tempy.directory({ prefix: 'pvm' })
    this._workingDir = workingDir
    logger.info(`Initialized worktree at "${workingDir}" for branch "${this.branch}"`)
    const artifactsExistsLocally = isBranchExists(this.cwd, this.branch)
    const artifactsExistsRemote = isRemoteBranchExists(this.cwd, this.branch)

    if (!artifactsExistsLocally && !artifactsExistsRemote) {
      // create empty branch
      await this.runShell(`git worktree add --detach --no-checkout ${workingDir}`)
      await this.branchShell(`git checkout --orphan ${this.branch}`)
      await this.branchShell(`git rm -rf .`)
      await this.branchShell(`git commit --allow-empty -m "branch storage: root commit"`)
    } else {
      if (!artifactsExistsLocally) {
        // auto checkout in `git worktree add` is supported only from git version 2.16.5 and in our node image at this moment git is 2.10.5
        gitFetch(this.cwd, { repo: 'origin', refspec: `${this.branch}:${this.branch}` })
      } else {
        gitFetch(this.cwd, { repo: 'origin' })
      }
      await this.runShell(`git worktree add -f ${workingDir} ${this.branch}`)
      if (artifactsExistsRemote) {
        await this.branchShell(`git reset --hard origin/${this.branch}`)
      }
    }
    if (!fse.existsSync(workingDir)) {
      throw new Error(`Unable to initialize ${workingDir}`)
    }
  }

  async finish(): Promise<void> {
    if (!this.workingDir || !fse.existsSync(this.workingDir)) {
      return
    }
    try {
      await this.runShell(`git worktree remove --force ${this.workingDir}`)
    } catch (e) {
      if (fse.existsSync(this.workingDir)) {
        try {
          await this.runShell(`rm -rf "${this.workingDir}"`)
        } catch (e) {}
      }
    }
  }

  async downloadPath(remotePath: string, localDest: string): Promise<void> {
    const sourcePath = path.join(this.workingDir, remotePath)
    if (fse.existsSync(sourcePath)) {
      await fse.copy(sourcePath, path.join(this.cwd, localDest))
    }
  }

  async uploadPath(localPath: string, remoteDest: string): Promise<void> {
    const gitVcs = new GitVcs({
      cwd: this.workingDir,
      config: this.config,
      resolvePushRemote: this.resolvePushRemote,
    })

    const commitContext = await gitVcs.beginCommit()
    const sourcePath = path.join(this.cwd, localPath)
    if (fse.existsSync(sourcePath)) {
      await fse.copy(sourcePath, path.join(this.workingDir, remoteDest))
    }
    if (isWorkingDirectoryClean(this.workingDir)) {
      logger.info('Nothing to commit and upload, artifacts are same in both locations')
      return
    }
    await this.branchShell(`git add "${remoteDest}"`)
    await gitVcs.commit(commitContext, `Upload "${localPath}" to "${remoteDest}" for branch "${this.branch}"`)
    await gitVcs.push({
      refspec: `HEAD:${this.branch}`,
    })
  }
}
