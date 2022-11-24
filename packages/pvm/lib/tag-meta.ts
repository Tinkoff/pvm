import isMonorepo from './is-monorepo'
import type { Pkg } from './pkg'
import type { Config } from '../types'
import { isFlatArraysEqual } from './utils'

export const pkgTagRe = /-v\d+\.\d+\.\d+/
const isSemverTagRe = /^v\d+\.\d+\.\d+/
const pkgNamespaceRe = /^@[^/]+\//

const semverTagMask = 'v[0-9]*'

// true -> release tags looks like release-<Date>-<suffix>
// false -> release tags looks like vX.Y.Z
export function isGenericTagUsed(config: Config): boolean {
  const { unified_versions_for, unified } = config.versioning
  const { release_tag_package } = config.tagging

  if (release_tag_package || !isMonorepo(config.cwd) || unified) {
    return false
  }

  return !isFlatArraysEqual(unified_versions_for, ['*'])
}

export function extractVersionFromSemverTag(semverTag: string): string {
  const matched = semverTag.match(/^v(\d+\.\d+\.\d+[^#]*)/)
  if (!matched) {
    throw new Error(`Tag "${semverTag}" doesn't look like a semver tag. Couldn't extract version from it.`)
  }
  return matched[1]
}

export function isSemverTagUsed(config: Config): boolean {
  return !isGenericTagUsed(config)
}

export function isSemverTag(tagName: string): boolean {
  return isSemverTagRe.test(tagName)
}

export function makeUnifiedReleaseTagTest(config: Config): (tagName: string) => boolean {
  return (tagName: string): boolean => {
    const { prefix } = config.tagging.generic_tag

    return tagName.startsWith(`${prefix}-`)
  }
}

export function releaseTagFilter(config: Config): (string) => boolean {
  return isGenericTagUsed(config) ? makeUnifiedReleaseTagTest(config) : isSemverTag
}

export function isReleaseTag(config: Config, tag: string): boolean {
  return releaseTagFilter(config)(tag)
}

export function releaseTagMask(config: Config): string {
  const { prefix } = config.tagging.generic_tag

  return isGenericTagUsed(config) ? `${prefix}-*` : semverTagMask
}

export function pkgTagMask(config: Config, pkg: Pkg): string {
  return !pkg.usingVersionFromSemverTagItself ? `${makePkgTagPrefix(config, pkg)}-${semverTagMask}` : semverTagMask
}

export function releaseTagPrefix(config: Config): string {
  const { prefix } = config.tagging.generic_tag

  return isGenericTagUsed(config) ? `${prefix}-` : 'v'
}

export function splitTag(tag: string): [string, string] {
  const versionIndex = tag.search(pkgTagRe)

  const name = tag.substring(0, versionIndex)
  const version = tag.substr(versionIndex + 2) // 2 for '-v'.length

  return [name, version]
}

export function nameFromTag(tag: string): string {
  return splitTag(tag)[0]
}

export function stripPkgNamespace(pkgName: string): string {
  return pkgName.replace(pkgNamespaceRe, '')
}

function makePkgTagPrefix(config: Config, pkg: Pkg): string {
  const { strip_namespace } = config.tagging.for_packages

  return `${strip_namespace ? pkg.shortName : pkg.name}`
}

export function semverTag(pkg: Pkg): string {
  return `v${pkg.version}`
}

export function makeTagForPkg(config: Config, pkg: Pkg): string {
  if (!pkg.isMonorepo) {
    return semverTag(pkg)
  }

  return `${makePkgTagPrefix(config, pkg)}-v${pkg.version}`
}

export function fsEscape(tagName: string): string {
  return tagName.replace(/\//g, '_')
}

const stubVersionRe = /^0\.0\.0-[A-Z_][\w-]*$/i

export function isStubVersion(version: string): boolean {
  return stubVersionRe.test(version)
}
