import semver from 'semver'
import { releaseTypes } from '@pvm/core/lib/semver-extra'
import { lazyCallee } from '@pvm/core/lib/class-helpers'
import { ImmutablePkgSet, PkgSet } from '@pvm/core/lib/pkg-set'
import getTemplateEnv from '@pvm/template/lib/env'
import { decreaseReleaseTypeForPackagesWithZeroMajorVersion } from './pkg-release-type'
import fromGlobPatterns from '@pvm/pkgset/lib/from-glob-patterns'

import type { ChangedContext } from './changed-context'
import type { UpdateContext } from './update-context'
import type { Repository } from '@pvm/repository/lib'
import type { Pkg, AppliedPkg } from '@pvm/core/lib/pkg'
import type { PvmReleaseType, SemverReleaseType } from '@pvm/core/types'

import { loggerFor } from '@pvm/core/lib/logger'

const logger = loggerFor('pvm:update')

function getMaxVersion(packages: Iterable<Pkg>): string {
  let maxVersion: string | undefined = ''
  for (const pkg of packages) {
    if (!maxVersion) {
      maxVersion = pkg.strictVersion
    } else if (pkg.strictVersion) {
      maxVersion = semver.gt(pkg.strictVersion, maxVersion) ? pkg.strictVersion : maxVersion
    }
  }
  return maxVersion || '0.0.1'
}

function makeProcessingDecorator(onlyInProcessing: boolean) {
  return (_target: any, propKey: string, desc: PropertyDescriptor): void => {
    const descKey: 'get' | 'value' = desc.get ? 'get' : 'value'
    const fn = desc[descKey]
    if (typeof fn !== 'function') {
      throw new TypeError(`processing decorator applied on non-function property ${propKey}`)
    }

    desc[descKey] = function(...args: any[]) {
      if (this._processing && !onlyInProcessing) {
        throw new Error(`Calling method ${propKey} are not allowed while update state under the construction`)
      }
      if (!this._processing && onlyInProcessing) {
        throw new Error(`Calling method ${propKey} are not allowed after update state have been processed`)
      }
      return fn.apply(this, args)
    }
  }
}

const allowAfterProcessing = makeProcessingDecorator(false)
const onlyInProcessing = makeProcessingDecorator(true)

// Отвечает на вопрос какая причина стала определяющей в изменении пакета
// Если две причины по итогу приводят к одному результату, будет записана та, которая имеет более высокий приоритет в работе
export enum UpdateReasonType {
  unknown = 'unknown',
  dependant = 'dependant',
  new = 'new',
  manually_set = 'manually_set',
  workspace_file = 'workspace_file',
  by_plugin = 'by_plugin',
  hints = 'hints',
  release_type_overrides = 'release_type_overrides',
  by_commits = 'by_commits',
  unified = 'unified',
  changed = 'changed',
  always_changed = 'always_changed'
}

/**
 *
 */
export class UpdateState {
  repo: Repository
  changedContext: ChangedContext
  updateContext: UpdateContext

  // pkg -> version
  newVersions: Map<Pkg, string> = new Map()
  // pkg -> releaseFilePath
  releaseFilesMap: Map<Pkg, string> = new Map()
  // pkg -> update reason
  updateReasonMap: Map<Pkg, UpdateReasonType> = new Map()
  // pkg -> release notes
  releaseNotes: Map<Pkg, string> = new Map()
  dependantOfMap: Map<Pkg, Pkg[]> = new Map()
  newDeps: Map<Pkg, Map<string, string>> = new Map()
  newPackages: PkgSet = new PkgSet()
  alwaysChangedPackages: ImmutablePkgSet

  // === промежуточные структуры
  // pkg -> release type
  wantedReleaseTypes: Map<Pkg, PvmReleaseType> = new Map()
  // для каких пакетов надо обновить зависимости исходя из newVersions
  updateDepsFor: Iterable<Pkg> = new Set<Pkg>()
  protected _processing = true
  protected _appliedPackages: ImmutablePkgSet<AppliedPkg>

  constructor(repo: Repository, changedContext: ChangedContext, updateContext: UpdateContext) {
    this.repo = repo
    this.changedContext = changedContext
    this.updateContext = updateContext

    const { dangerously_opts } = repo.config
    const always_changed_workspaces = dangerously_opts?.always_changed_workspaces || []

    this.alwaysChangedPackages = new ImmutablePkgSet(fromGlobPatterns(repo.config, always_changed_workspaces, repo.ref))
  }

  @onlyInProcessing
  aboutToChange(): IterableIterator<Pkg> {
    return this.wantedReleaseTypes.keys()
  }

  getBaselineVersion(pkgGroup: Iterable<Pkg>): string {
    return getMaxVersion(pkgGroup)
  }

  getLikelyReleaseTypeFor(pkg: Pkg): SemverReleaseType | null {
    const newVersion = this.newVersions.get(pkg)
    if (newVersion) {
      return semver.diff(pkg.version, newVersion)
    }
    return this.wantedToSemver(pkg)
  }

  getLikelyVersionFor(pkg: Pkg): string | null {
    const releaseType = this.getLikelyReleaseTypeFor(pkg)
    if (releaseType) {
      return semver.inc(pkg.version, releaseType)
    }
    return null
  }

  wantedToSemver(pkg: Pkg): SemverReleaseType | null {
    const releaseType = this.wantedReleaseTypes.get(pkg)
    if (releaseType === 'none') {
      return null
    }
    return releaseType || null
  }

  @onlyInProcessing
  calcGroupReleaseType(pkgGroup: ImmutablePkgSet, baselineVersion: string): PvmReleaseType | null {
    let maxReleaseType: PvmReleaseType | null = null
    let wasNotNew = false
    let someNewPackageWithLowVersion = false
    for (const pkg of pkgGroup) {
      if (!wasNotNew && !this.newPackages.has(pkg)) {
        wasNotNew = true
      }
      const releaseType = this.wantedReleaseTypes.get(pkg)
      if (releaseType) {
        if (maxReleaseType) {
          maxReleaseType = releaseTypes.gt(releaseType, maxReleaseType) ? releaseType : maxReleaseType
        } else {
          maxReleaseType = releaseType
        }
      }

      if (this.newPackages.has(pkg) && (!pkg.strictVersion || semver.lte(pkg.strictVersion, baselineVersion))) {
        someNewPackageWithLowVersion = true
      }
    }

    // если у нас есть новый пакет, версия которого ниже или равна версии группы или он без версии
    // и в группе есть не новые пакеты
    // то для консистентности группы нужно поднять версию на минимально необходимый уровень
    if (wasNotNew && (!maxReleaseType || maxReleaseType === 'none') && someNewPackageWithLowVersion) {
      maxReleaseType = this.repo.config.update.default_release_type
      if (maxReleaseType && this.repo.config.update.respect_zero_major_version) {
        maxReleaseType = decreaseReleaseTypeForPackagesWithZeroMajorVersion(baselineVersion, maxReleaseType)
      }
    }

    return maxReleaseType
  }

  @onlyInProcessing
  hasNewVersionOrReleaseType(pkg: Pkg): boolean {
    return this.newVersions.has(pkg) || this.wantedReleaseTypes.has(pkg)
  }

  pvmInc(pkg: Pkg, releaseType: PvmReleaseType): string | null {
    if (releaseType === 'none') {
      return pkg.version
    }
    return semver.inc(pkg.version, releaseType)
  }

  @onlyInProcessing
  async finalize(): Promise<this> {
    for (const [pkg, releaseType] of this.wantedReleaseTypes) {
      logger.debug(`wanted ${releaseType} release type for package "${pkg.name}"`)
      const newVersion = this.pvmInc(pkg, releaseType)
      if (newVersion && !this.newVersions.has(pkg)) {
        this.newVersions.set(pkg, newVersion)
      }
    }

    this._appliedPackages = this.repo.applyVersions(this.newVersions, {
      updateDependantsVersion: false,
      predefinedDependants: this.updateDepsFor,
    })

    await addDependantsReleaseNotes(this, this._appliedPackages)

    this._processing = false
    return this
  }

  @allowAfterProcessing
  getEffectiveReleaseType(pkg: Pkg): SemverReleaseType | null {
    const newVersion = this.newVersions.get(pkg)
    if (!newVersion) {
      return null
    }
    return semver.diff(pkg.version, newVersion)
  }

  getNewVersionOrCurrent(pkg: Pkg): string {
    return this.newVersions.get(pkg) || pkg.version
  }

  hasSameVersion(pkg: Pkg): boolean {
    // если есть пред. версия и она четко равна новой, нам такой пакет не нужен в списке на релиз
    const prevVersion = this.changedContext.getPrevVersion(pkg.name)
    return prevVersion !== void 0 && prevVersion === this.getNewVersionOrCurrent(pkg)
  }

  @allowAfterProcessing
  @lazyCallee
  getReleasePackages(): Map<Pkg, AppliedPkg> {
    const result = new Map<Pkg, AppliedPkg>()
    for (const pkg of this.newVersions.keys()) {
      if (!this.hasSameVersion(pkg)) {
        result.set(pkg, this._appliedPackages.get(pkg.name)!)
      }
    }
    return result
  }

  @allowAfterProcessing
  get isSomethingForRelease(): boolean {
    return this.getReleasePackages().size > 0
  }

  @allowAfterProcessing
  getUpdateReason(pkgName: string): UpdateReasonType | undefined {
    const pkg = this.repo.packagesMaybeWithRoot.get(pkgName)
    if (pkg) {
      return this.updateReasonMap.get(pkg)
    }
  }

  isPkgChanged(pkgName: string): boolean {
    const pkg = this.repo.packagesMaybeWithRoot.get(pkgName)
    if (!pkg) {
      throw new Error(`isPkgChanged: there is no ${pkgName} package in repository with ref=${this.repo.ref}`)
    }
    return this.changedContext.packages.has(pkgName)
  }

  isPkgChangedOrNotFound(pkgName: string, notFoundValue: boolean): boolean {
    const pkg = this.repo.packagesMaybeWithRoot.get(pkgName)
    if (!pkg) {
      return notFoundValue
    }
    return this.changedContext.packages.has(pkgName)
  }
}

async function addDependantsReleaseNotes(updateState: UpdateState, appliedPackages: ImmutablePkgSet<AppliedPkg>): Promise<void> {
  const { repo, changedContext } = updateState
  const hostApi = await repo.getHostApi()
  const templateEnv = await getTemplateEnv(repo.cwd)

  const originReleaseNotes = await hostApi.commitsToNotes(changedContext.commits)

  for (const [pkg /* , dependantOfPkgs */] of updateState.dependantOfMap) {
    const appliedPkg = appliedPackages.get(pkg.name)!

    // this happens when hints.update-dependants-for or config.update.update_dependants are set release-type to 'none'
    if (!appliedPkg) {
      continue
    }

    const releaseNotes = templateEnv.render('pkg-update-deps', {
      pkg: appliedPkg,
      newDepKeys: Array.from(appliedPkg.newDeps.keys()),
      originReleaseNotes,
    })

    updateState.releaseNotes.set(pkg, releaseNotes)
  }
}
