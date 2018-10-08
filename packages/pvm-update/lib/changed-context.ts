import gitCommits from '@pvm/core/lib/git/commits'
import { ImmutablePkgSet } from '@pvm/core/lib/pkg-set'
import { pkgsetFromChangedFiles } from '@pvm/pkgset/lib/from-changed-files'
import { pkgsetFromRef } from '@pvm/pkgset/lib/pkgset-from-ref'
import { pkgCommits } from '@pvm/core/lib/git/pkg-commits'

import type { Config } from '@pvm/core/lib/config'
import type { IncludeRootOption } from '@pvm/pkgset/types'
import type { Commit } from '@pvm/core/types/git-log'
import type { ChangedFiles } from '@pvm/pkgset/lib/changed-files'

/**
 * Отвечает на вопросы что поменялось (файлы, пакеты) и за какой период истории git'а это произошло.
 */
export interface ChangedContextState {
  fromRef: string,
  targetRef: string | undefined,
  commits: Commit[],
  files: string[],
  packages: ImmutablePkgSet,
}

export interface ChangedContextOptions {
  includeRoot?: IncludeRootOption,
  config: Config,
}

export interface ChangedContextAsyncDerivatives {
  commits: Commit[],
}

/**
 *
 */
export class ChangedContext implements ChangedContextState {
  commits: Commit[]
  packages: ChangedContextState['packages']
  prevPackages: ImmutablePkgSet
  changedFiles: ChangedFiles

  options: ChangedContextOptions

  static async make(changedFiles: ChangedFiles, options: Omit<ChangedContextOptions, 'commits'>): Promise<ChangedContext> {
    const { config } = options
    const commits = await gitCommits(config.cwd, changedFiles.fromRef, changedFiles.targetRef)

    return new ChangedContext(changedFiles, options, { commits })
  }

  constructor(changedFiles: ChangedFiles, options: ChangedContextOptions, derivatives: ChangedContextAsyncDerivatives) {
    this.changedFiles = changedFiles
    this.options = options
    this.commits = derivatives.commits

    const { includeRoot = 'auto', config } = options

    this.packages = new ImmutablePkgSet(pkgsetFromChangedFiles(config, changedFiles, {
      includeRoot,
    }))

    this.prevPackages = new ImmutablePkgSet(pkgsetFromRef(config, changedFiles.fromRef, {
      includeRoot,
    }))
  }

  get files(): string[] {
    return this.changedFiles.files
  }

  get fromRef(): string {
    return this.changedFiles.fromRef
  }

  get targetRef(): string {
    return this.changedFiles.targetRef
  }

  get targetLoadRef(): string | undefined {
    return this.changedFiles.targetLoadRef
  }

  getPrevVersion(pkgName: string): string | undefined {
    if (this.prevPackages.has(pkgName)) {
      return this.prevPackages.get(pkgName)!.version
    }
  }

  async pkgCommitsFor(pkgName: string): Promise<Commit[]> {
    const pkg = this.packages.get(pkgName)
    if (pkg) {
      return await pkgCommits(pkg, this.fromRef, this.targetRef)
    }
    return []
  }

  getChangedFilesFor(pkgName: string): string[] {
    const pkg = this.packages.get(pkgName)
    if (!pkg) {
      return []
    }
    if (pkg.path === '.') {
      return this.files
    }
    return this.files.filter(p => `${p}/`.startsWith(`${pkg.path}/`))
  }
}
