import path from 'path'
import fs from 'fs'
import fastDeepEqual from 'fast-deep-equal'

import { isSemverTagUsed, pkgTagMask, splitTag, stripPkgNamespace, isStubVersion, extractVersionFromSemverTag } from './tag-meta'
import { defaultConfig } from './config'
import { wdShell } from './shell'
import isMonorepo from './is-monorepo'
import { cachedRealPath } from './fs'
import { loggerFor } from './logger'
import { lastMatchedTag, lastReleaseTag } from './git/last-release-tag'
import { lazyCallee } from './class-helpers'
import { versioningFile } from './dedicated-versions-file'
import { isPkgFromMainUnifiedGroup, searchAnnotatedVersionInDepth } from './versioning'
import { clone } from 'rfc6902/util'
import revParse from './git/rev-parse'

import type { Config, PkgAppliedMeta, PkgDeps, PkgMeta } from '../types'

import { cwdToGitRelativity } from './git/worktree'

const logger = loggerFor('pvm:pkg')
// eslint-disable-next-line no-use-before-define
const pkgCache = new Map<string, Pkg>()

function detectRangePrefix(semverString: string): string {
  const m = /^[^\d\w]+/.exec(semverString)
  return m ? m[0] : ''
}

function detectIndent(str: string): number {
  let indent = 0
  const len = str.length

  for (let i = 0; i < len; i++) {
    if (str[i] === ' ') {
      indent += 1
    }

    if (str[i] === '"') break
  }

  return indent
}

export interface LoadPkgOptions {
  cwd?: string,
  ref?: string,
  sourcePath?: string,
}

const allOwnDepsKeys = [
  'dependencies',
  'devDependencies',
  'optionalDependencies',
]

const allDepsKeys = [
  ...allOwnDepsKeys,
  'peerDependencies',
]

export interface PkgCreateOpts {
  indent?: number,
  cwd?: string,
  ref?: string,
  config?: Config,
  sourcePath?: string,
}

export class Pkg {
  indent: number
  meta: PkgMeta
  path: string
  sourcePath: string
  readonly name: string
  readonly shortName: string
  _cwd: string
  private readonly _config: Config
  protected _ref: string | undefined

  constructor(pkgPath: string, manifest: PkgMeta, opts: PkgCreateOpts = {}) {
    const { indent = 2, config = defaultConfig, cwd = config && config.cwd || process.cwd(), ref } = opts
    this.indent = indent
    this._cwd = cwd
    this.path = pkgPath
    this.sourcePath = opts.sourcePath ?? pkgPath
    this._config = config
    this._ref = ref

    this.meta = manifest

    let pkgName = manifest.name
    if (!pkgName && this.isRoot) {
      pkgName = '_root_'
    }

    if (!pkgName) {
      throw new Error(`package at ${pkgPath} doesn't have name field`)
    }
    this.name = pkgName
    this.shortName = stripPkgNamespace(pkgName)
  }

  getCwd(): string {
    return this._cwd
  }

  get pvmConfig(): Config {
    return this._config
  }

  get ref(): string | undefined {
    return this._ref
  }

  getVersion<F extends string | undefined = undefined>(fallbackVersion: F = void 0 as F): string | F {
    let version: string | undefined
    const { source } = this._config.versioning

    if (source === 'tag') {
      const releaseTag = lastReleaseTag(this._config, this._ref)
      if (this.usingVersionFromSemverTagItself) {
        if (releaseTag) {
          version = extractVersionFromSemverTag(releaseTag)
        }
      } else {
        let tookEmbeddedVersionFromReleaseTag = false
        if (releaseTag) {
          const maybeAnnotatedVersion = searchAnnotatedVersionInDepth(this._config, releaseTag, this.name)
          if (maybeAnnotatedVersion) {
            version = maybeAnnotatedVersion
            tookEmbeddedVersionFromReleaseTag = true
          }
        }
        if (!tookEmbeddedVersionFromReleaseTag) {
          // фоллбэк на теги вида pkg-name-v1.2.3
          const pkgTagName = lastMatchedTag(this._cwd, pkgTagMask(this._config, this), this._ref)
          if (pkgTagName) {
            version = splitTag(pkgTagName)[1]
          } else {
            // сейчас исключение бросать нельзя из-за несколько грубой реализации в release-info.changedPackagesFromRef для однопакетных реп которые берут версию из тэгов
            // throw new Error(`Couldn't calculate version from tags for package ${this.name}`)
            logger.warn(
              `Couldn't calculate version from tags for package ${this.name}. Fallback to ${fallbackVersion}`
            )
          }
        }
      }
    } else if (source === 'file') {
      if (versioningFile.existsForRef(this.pvmConfig, this._ref)) {
        const dedicatedVersion = versioningFile.lookupPkgVersion(this, this._ref)
        if (dedicatedVersion) {
          version = dedicatedVersion
        }
      } else {
        // если на тот момент файла не существовало фоллбечимся на meta.version
        version = this.meta.version
      }
    } else if (source === 'package') {
      version = this.meta.version
    }
    if (source !== 'package' && !version && this.meta.initialVersion) {
      version = this.meta.initialVersion
    }
    if (source !== 'package' && version && isStubVersion(version)) {
      // в выделенном версионировании мы не можем возвращать stub версию как легитимную
      // поэтому возвращаем fallbackVersion
      // скорее всего это означает что пакет только-только добавили или переименовали существующий
      // при этом у него прописана stub версия в package.json
      return fallbackVersion
    }
    return version || fallbackVersion
  }

  @lazyCallee
  get version(): string {
    return this.getVersion('0.0.1')
  }

  @lazyCallee
  get strictVersion(): string | undefined {
    return this.getVersion()
  }

  resetLazyForVersion() {
    // @ts-ignore
    this._lazyReset_version()
    // @ts-ignore
    this._lazyReset_strictVersion()
  }

  @lazyCallee
  get publishPath(): string {
    let publishPath = this.path
    const pathMapping = this._config.publish.path_mapping
    if (pathMapping) {
      for (const pkgPathPrefix of Object.keys(pathMapping)) {
        if (this.path.startsWith(pkgPathPrefix)) {
          publishPath = this.path.replace(pkgPathPrefix, pathMapping[pkgPathPrefix])
          break
        }
      }
    }

    if (this._config.publish.path_subdir) {
      publishPath = path.join(publishPath, this._config.publish.path_subdir)
    }

    // relative path should starts with dot, see https://github.com/npm/cli/issues/2796
    return path.isAbsolute(publishPath) ? publishPath : `./${publishPath}`
  }

  @lazyCallee
  get publishRegistry(): string | undefined {
    return this.meta.publishConfig && this.meta.publishConfig.registry
  }

  @lazyCallee
  get isRoot(): boolean {
    return this.absPath === this._cwd
  }

  @lazyCallee
  get absPath(): string {
    return path.resolve(this._cwd, this.path)
  }

  @lazyCallee
  get manifestPath(): string {
    return path.join(this.absPath, 'package.json')
  }

  @lazyCallee
  get isMonorepo(): boolean {
    return isMonorepo(this._cwd)
  }

  @lazyCallee
  get usingVersionFromSemverTagItself(): boolean {
    const config = this._config

    if (!isSemverTagUsed(config)) {
      return false
    }

    if (config.tagging.release_tag_package) {
      return this.name === config.tagging.release_tag_package
    }

    if (config.versioning.unified) {
      return isPkgFromMainUnifiedGroup(this._config, this)
    }

    return true
  }

  @lazyCallee
  get deps(): PkgDeps {
    const { deps_keys } = this._config.core

    const deps = Object.create(null)
    for (const depsKey of deps_keys) {
      if (this.meta[depsKey]) {
        Object.assign(deps, this.meta[depsKey])
      }
    }
    return deps
  }

  @lazyCallee
  get allOwnDeps(): PkgDeps {
    const { deps_keys } = this._config.core
    const allOwnDeps = Object.assign(Object.create(null), this.deps)

    for (const depsKey of allOwnDepsKeys) {
      if (deps_keys.indexOf(depsKey) !== -1) {
        continue
      }
      if (this.meta[depsKey]) {
        Object.assign(allOwnDeps, this.meta[depsKey])
      }
    }

    return allOwnDeps
  }

  stringify() {
    return stringifyPkg(this)
  }

  save() {
    fs.writeFileSync(this.manifestPath, this.stringify())
    pkgCache.delete(getCacheKey(this._config, this.path, this._ref))
  }

  applyMeta(newMeta: PkgAppliedMeta): AppliedPkg {
    return new AppliedPkg(this.path, clone(newMeta), {
      indent: this.indent,
      config: this._config,
      cwd: this._cwd,
      ref: this._ref,
    })
  }

  getAppliedMeta(): PkgAppliedMeta {
    return {
      ...clone(this.meta),
      version: this.meta.version || '0.0.1',
    }
  }

  toApplied(): AppliedPkg {
    return this.applyMeta(this.getAppliedMeta())
  }

  // возвращает в каких ключах (dependencies, devDependencies, ...) есть переданная зависимость
  getDepKeys(pkgName: string): string[] {
    const result: string[] = []
    for (const depKey of allDepsKeys) {
      if (this.meta[depKey] && pkgName in this.meta[depKey]) {
        result.push(depKey)
      }
    }
    return result
  }

  applyNewDeps(newDeps: Map<string, string>, newMeta: PkgAppliedMeta | undefined = void 0): AppliedPkg {
    const newPkg = this.applyMeta(newMeta || this.getAppliedMeta())
    newPkg.setNewDeps(newDeps)

    return newPkg
  }

  applyVersion(newVersion: string, newDeps?: Map<string, string> | undefined): AppliedPkg {
    const newMeta = {
      ...this.meta,
      version: newVersion,
    }
    return newDeps ? this.applyNewDeps(newDeps, newMeta) : this.applyMeta(newMeta)
  }

  isMetaEqualsTo(pkg: Pkg): boolean {
    return fastDeepEqual(this.meta, pkg.meta)
  }

  isAllowedForPublishing(): boolean {
    // we never want publish root package in monorepository or private packages
    return !this.meta.private && !(this.isMonorepo && this.isRoot && !this.pvmConfig.publish.include_monorepo_root)
  }

  toJSON() {
    const { _config, ...rest } = this
    return {
      ...rest,
      version: this.version,
    }
  }
}

export interface PkgDiff {
  version?: string | undefined,
  deps: Map<string, string>,
}

export class AppliedPkg extends Pkg {
  protected _newDeps: Map<string, string> = new Map()
  meta: PkgAppliedMeta

  constructor(pkgPath: string, manifest: PkgAppliedMeta, opts: PkgCreateOpts = {}) {
    super(pkgPath, manifest, opts)
  }

  setNewDeps(newDeps: Map<string, string>) {
    this._newDeps = newDeps
    for (const [pkgName, depVersion] of newDeps) {
      const depKeys = this.getDepKeys(pkgName)
      for (const depKey of depKeys) {
        const semverPrefix = detectRangePrefix(this.meta[depKey][pkgName])
        this.meta[depKey][pkgName] = `${semverPrefix}${depVersion}`
      }
    }
  }

  get newDeps(): Map<string, string> {
    return this._newDeps
  }

  get version(): string {
    return this.meta.version
  }

  getMetaDiff(pkg: Pkg): PkgDiff {
    const diff: PkgDiff = {
      deps: new Map(),
    }

    if (pkg.meta.version !== this.meta.version) {
      diff.version = this.meta.version
    }

    for (const [depName, depSpec] of Object.entries(this.allOwnDeps)) {
      if (!(depName in pkg.allOwnDeps) || pkg.allOwnDeps[depName] !== depSpec) {
        diff.deps.set(depName, depSpec)
      }
    }

    return diff
  }
}

const configNumMap = new WeakMap<Config, number>()
let globalSeenConfigCounter = 0

function getConfigNum(config: Config): number {
  if (!configNumMap.has(config)) {
    configNumMap.set(config, globalSeenConfigCounter++)
  }
  return configNumMap.get(config)!
}

function getCacheKey(config: Config, pkgPath: string, ref: string | undefined): string {
  const absPath = path.resolve(cachedRealPath(config.cwd), pkgPath)
  const revSha = revParse(ref || 'HEAD', config.cwd)

  // Элемент !!ref нужен т.к. при не заданном ref, даже при том же revSha, чтение будет выполняться из файловой системы
  // и мы не хотим, чтобы кеши файловая система/git пересекались
  return [absPath, getConfigNum(config), !!ref, revSha].filter(Boolean).join('-')
}

// Если ref задан читаем из гита по этому ref,даже если он HEAD.
// если нет то из file system
export function loadPkg(config: Config, pkgPath: string, opts: LoadPkgOptions = {}): Pkg | null {
  const { cwd = config.cwd, ref, sourcePath } = opts
  const absPath = path.resolve(cachedRealPath(cwd), pkgPath)
  const cacheKey = getCacheKey(config, pkgPath, ref)
  if (pkgCache.has(cacheKey)) {
    return pkgCache.get(cacheKey)!
  }
  let manifestRaw
  if (ref) {
    try {
      manifestRaw = wdShell(cwd, `git show ${ref}:${cwdToGitRelativity(config.cwd, pkgPath)}/package.json`)
    } catch (e) {
      // пакета в данном рефе нет
      return null
    }
  } else {
    const manifestPath = path.join(absPath, 'package.json')
    if (!fs.existsSync(manifestPath)) {
      return null
    }
    manifestRaw = fs.readFileSync(manifestPath, { encoding: 'utf8' })
  }

  const indent = detectIndent(manifestRaw)

  const pkg = new Pkg(pkgPath, JSON.parse(manifestRaw), {
    indent,
    config,
    ref,
    sourcePath,
  })

  pkgCache.set(cacheKey, pkg)
  return pkg
}

export function stringifyPkg(pkg: Pkg, manifest = pkg.meta): string {
  return JSON.stringify(manifest, null, pkg.indent) + '\n'
}

export function concatPackages(left: Iterable<Pkg>, right: Iterable<Pkg>): Pkg[] {
  const seen = Object.create(null)
  const result: Pkg[] = []
  for (const pkg of left) {
    if (!(pkg.name in seen)) {
      result.push(pkg)
      seen[pkg.name] = 1
    }
  }

  for (const pkg of right) {
    if (!(pkg.name in seen)) {
      result.push(pkg)
      seen[pkg.name] = 1
    }
  }

  return result
}
