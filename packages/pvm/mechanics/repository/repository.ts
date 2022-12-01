import semver from 'semver'
import { lazyCallee } from '../../lib/class-helpers'
import { pkgsetAll } from '../pkgset/pkgset-all'
import { loadPkg } from '../../lib/pkg'
import includeRootResolve from '../pkgset/include-root-resolve'
import { getUnifiedGroups } from './unified-groups'
import { ImmutablePkgSet, PkgSet } from '../../lib/pkg-set'
import loadHintsFile, { validateUpdateHints } from '../../lib/hints-file'
import { lastReleaseTag } from '../../lib/git/last-release-tag'
import { logger } from '../../lib/logger'
import { noPackagesInMugError } from '../../lib/behaviors/no-packages-in-mug'

import type { Config, HostApi, UpdateHints } from '../../types'
import type { Pkg, AppliedPkg } from '../../lib/pkg'

import { wdShell } from '../../lib/shell'
import revParse from '../../lib/git/rev-parse'
import type { Container } from '../../lib/di'
import type { HOST_API_TOKEN } from '../../tokens'
import { REPOSITORY_FACTORY_TOKEN } from '../../tokens'
import type { PlatformInterface } from '../platform'

interface RepositoryInitOpts {
  ref?: string | void,
  skipValidatingConfig?: boolean,
}

export interface HintsContext {
  hints: UpdateHints,
  // Индикатор того, что файл хинтов прочитан. Одновременно является путем до файла хинтов.
  readHintsFile: string | false,
}

interface ApplyVersionOpts {
  predefinedDependants?: Iterable<Pkg> | void,
  updateDependantsVersion?: boolean,
}

export class Repository {
  cwd: string
  config: Config
  platform: PlatformInterface<any, any>
  hostApi: HostApi
  ref: string | undefined

  constructor({
    config,
    hostApi,
    cwd,
    platform,
    ref,
  }: { config: Config, hostApi: HostApi, platform: PlatformInterface<any, any>, cwd: string, ref: string | void}) {
    this.config = config
    this.hostApi = hostApi
    this.platform = platform
    this.cwd = cwd
    if (ref) {
      this.ref = ref
    }
  }

  static async init(di: Container, opts: RepositoryInitOpts = {}): Promise<Repository> {
    const repo = di.get(REPOSITORY_FACTORY_TOKEN)({ ref: opts.ref })

    if (!opts.skipValidatingConfig) {
      repo.validateConfig()
    }

    return repo
  }

  validateConfig() {
    const { config } = this

    if (config.tagging.release_tag_package && !this.packagesMaybeWithRoot.has(config.tagging.release_tag_package)) {
      throw new Error(`Setting "tagging.release_tag_package" has value "${config.tagging.release_tag_package}", but there is no package with that name`)
    }

    if (config.versioning.unified && this.unifiedGroupsMWR.mainUnifiedGroup.size === 0) {
      if (!config.tagging.release_tag_package) {
        throw noPackagesInMugError()
      } else {
        logger.warn(
          `Repository at "${this.cwd}" have versioning.unified setting enabled, but there are no packages in main unified group`
        )
      }
    }
  }

  @lazyCallee
  get pkgset(): ImmutablePkgSet {
    return new ImmutablePkgSet(pkgsetAll(this.config, { includeRoot: false, ref: this.ref }))
  }

  getVersionsMap(fromPackage = false): Record<string, string> {
    const result: Record<string, string> = Object.create(null)
    for (const pkg of this.pkgset) {
      const version = fromPackage ? pkg.meta.version : pkg.version
      if (version) {
        result[pkg.name] = version
      }
    }
    return result
  }

  getHostApi(): typeof HOST_API_TOKEN {
    return this.hostApi
  }

  @lazyCallee
  get packagesList(): ReadonlyArray<Pkg> {
    return this.pkgset.toArray()
  }

  @lazyCallee
  get packagesMaybeWithRoot(): ImmutablePkgSet {
    const result = this.pkgset.asMut()
    if (includeRootResolve(this.config.update.include_root, this.config, this.ref) && this.rootPkg) {
      result.add(this.rootPkg)
    }

    return result.freeze()
  }

  @lazyCallee
  get unifiedGroupsMWR(): ReturnType<typeof getUnifiedGroups> {
    return getUnifiedGroups(this.config, this.packagesMaybeWithRoot)
  }

  @lazyCallee
  // builds tree, where keys are packages and values are direct dependants
  get dependantsTree(): Map<Pkg, Pkg[]> {
    // dependantsTree: [pkg] -> all packages which depends on pkg (dependants)
    const dependantsTree = new Map<Pkg, Pkg[]>()
    for (const pkg of this.pkgset) {
      const deps = pkg.deps
      for (const depName of Object.keys(deps)) {
        const depPkg = this.pkgset.get(depName)
        if (depPkg) {
          const pkgList = dependantsTree.get(depPkg) || []
          pkgList.push(pkg)
          dependantsTree.set(depPkg, pkgList)
        }
      }
    }

    return dependantsTree
  }

  get isMonorepo(): boolean {
    return this.rootPkg ? !!this.rootPkg.meta.workspaces : false
  }

  @lazyCallee
  get rootPkg(): Pkg | null {
    return loadPkg(this.config, '.', { ref: this.ref })
  }

  @lazyCallee
  async hintsContext(): Promise<HintsContext> {
    const { hints_file } = this.config.update
    const [hints, hintsFileExists] = await loadHintsFile(this.config, hints_file, this.ref)

    if (hintsFileExists) {
      return {
        hints,
        readHintsFile: hintsFileExists ? hints_file : false,
      }
    }

    const platform = this.platform
    const updateHints = (await platform.getUpdateHintsByCommit(revParse('HEAD', this.cwd))) ?? {}

    validateUpdateHints(this.config, updateHints)

    return {
      hints: updateHints,
      readHintsFile: false,
    }
  }

  @lazyCallee
  get registry(): string {
    return wdShell(this.cwd, `npm config get registry`)
  }

  getLastReleaseTag(target?: string): string | null {
    return lastReleaseTag(this.config, target) || null
  }

  getDependantsMap(packages: ImmutablePkgSet, { includeProvided = false }: { includeProvided?: boolean } = {}): Map<Pkg, Set<Pkg>> {
    const dependantsTree = this.dependantsTree
    const seenPackages = new Map<Pkg, boolean>()
    const result = new Map<Pkg, Set<Pkg>>()

    function treeWalker(hostPkg: Pkg, seenHostPackages: Set<Pkg> = new Set()): void {
      if (seenPackages.has(hostPkg)) {
        return
      }
      seenPackages.set(hostPkg, true)

      for (const pkg of (dependantsTree.get(hostPkg) || [])) {
        const newSeen = (new Set(seenHostPackages)).add(hostPkg)
        if (includeProvided || !packages.has(pkg)) {
          if (!result.has(pkg)) {
            result.set(pkg, new Set<Pkg>())
          }
          for (const seenPkg of newSeen) {
            if (packages.has(seenPkg)) {
              result.get(pkg)!.add(seenPkg)
            }
          }
        }

        treeWalker(pkg, newSeen)
      }
    }

    for (const pkg of packages) {
      treeWalker(pkg)
    }

    return result
  }

  applyVersions(_newVersions: Map<Pkg, string>, opts: ApplyVersionOpts = {}): ImmutablePkgSet<AppliedPkg> {
    const {
      predefinedDependants,
      updateDependantsVersion = true,
    } = opts
    const newVersions = new Map<Pkg, string>(_newVersions.entries())
    const updateDepsFor = predefinedDependants || this.getDependants(new ImmutablePkgSet(newVersions.keys()), {
      includeProvided: true,
    })

    const newDeps: Map<Pkg, Map<string, string>> = new Map()

    for (const pkg of updateDepsFor) {
      const deps = pkg.deps
      const newPkgDeps: Map<string, string> = new Map()
      for (const depName of Object.keys(deps)) {
        const depPkg = this.pkgset.get(depName)
        if (depPkg && newVersions.has(depPkg)) {
          newPkgDeps.set(depName, newVersions.get(depPkg) || depPkg.version)
        }
      }
      if (newPkgDeps.size) {
        newDeps.set(pkg, newPkgDeps)

        if (updateDependantsVersion && !newVersions.has(pkg)) {
          newVersions.set(pkg, semver.inc(pkg.version, 'patch')!)
        }
      }
    }

    const totalChangedPkgs = new ImmutablePkgSet([...newVersions.keys(), ...newDeps.keys()])
    const result = new PkgSet<AppliedPkg>()
    for (const pkg of totalChangedPkgs) {
      const newVersion = newVersions.get(pkg)
      const pkgNewDeps = newDeps.get(pkg)
      if (!newVersion && !pkgNewDeps) {
        // runtime проверка если newVersion прилетит как null
        // @TODO убрать после того как в проекте будет включен strictNullChecks
        continue
      }

      const appliedPkg =
        newVersion
          ? pkg.applyVersion(newVersion, pkgNewDeps)
          : pkgNewDeps ? pkg.applyNewDeps(pkgNewDeps) : pkg.toApplied()

      result.add(appliedPkg)
    }

    return result.freeze()
  }

  applyActualDeps(pkg: Pkg, newVersions: Map<Pkg, string> | undefined = undefined): AppliedPkg {
    const deps = pkg.deps
    const newDeps: Map<string, string> = new Map()
    for (const depName of Object.keys(deps)) {
      const depPkg = this.pkgset.get(depName)
      if (depPkg) {
        newDeps.set(depName, newVersions && newVersions.get(depPkg) || depPkg.version)
      }
    }
    if (newDeps.size) {
      return pkg.applyNewDeps(newDeps)
    }
    return pkg.toApplied()
  }

  getDependants(packages: ImmutablePkgSet, opts?: { includeProvided?: boolean }): IterableIterator<Pkg> {
    return this.getDependantsMap(packages, opts).keys()
  }
}
