import { matchAny } from './pkg-match'
import isMonorepo from './is-monorepo'
import { getTagAnnotation, getRefContent, revParse } from './git/commands'
import { lastReleaseTag } from './git/last-release-tag'
import { logger } from './logger'
import { releaseMark } from './consts'
import gitRevParse from './git/rev-parse'

import type { Config } from './config'
import type { Pkg } from './pkg'

export function isReleaseCommit(cwd: string, ref: string): boolean {
  const refContent = getRefContent(cwd, gitRevParse(ref, cwd))
  return refContent.trim().endsWith(releaseMark)
}

export function isPkgFromMainUnifiedGroup(config: Config, pkg: Pkg): boolean {
  if (!isMonorepo(config.cwd)) {
    // не в монорепе единственный пакет всегда в "главной группе"
    return true
  }
  const { unified_versions_for = [], independent_packages, unified } = config.versioning

  if (!unified) {
    return false
  }

  if (matchAny(pkg, independent_packages)) {
    return false
  }

  for (const scopePatternValue of unified_versions_for) {
    const scopePatterns: string[] = typeof scopePatternValue === 'string' ? [scopePatternValue] : scopePatternValue
    if (matchAny(pkg, scopePatterns)) {
      return false
    }
  }

  if (Array.isArray(unified)) {
    return matchAny(pkg, unified)
  }

  return true
}

export function extractVersionsFromAnnotation(annotation: string): Map<string, string> {
  const versions = new Map<string, string>()

  const delimRe = /---\r?\n/g
  let lastEffectiveOffset
  while (delimRe.exec(annotation) !== null) {
    lastEffectiveOffset = delimRe.lastIndex
  }
  if (lastEffectiveOffset === void 0) {
    return versions
  }

  const payload = annotation.substr(lastEffectiveOffset)
  if (!payload) {
    return versions
  }

  const packageVersionRe = /((?:@[^/]+\/)?[^@]+)@(\d+\.\d+\.\d+(?:[-+][0-9A-Za-z-.+]+)?)\r?\n?/gm
  let versionMatch
  while ((versionMatch = packageVersionRe.exec(payload))) {
    const name = versionMatch[1]
    const version = versionMatch[2]
    versions.set(name, version)
  }

  return versions
}

const versionsMapCached: Map<string, Map<string, string>> = new Map()

export function getVersionsFromTagCached(cwd: string, tagName: string): Map<string, string> {
  const cacheKey = `${cwd}:${tagName}`
  let result = versionsMapCached.get(cacheKey)
  if (!result) {
    const tagAnnotation = getTagAnnotation(cwd, tagName)
    result = extractVersionsFromAnnotation(tagAnnotation)
    versionsMapCached.set(cacheKey, result)
  }
  return result
}

export function searchAnnotatedVersionInDepth(config: Config, fromTag: string, pkgName: string): string | undefined {
  let currentTag = fromTag
  const { annotation_lookup_depth } = config.tagging
  let depth = 0
  while (currentTag) {
    const versions = getVersionsFromTagCached(config.cwd, currentTag)
    if (versions.has(pkgName)) {
      return versions.get(pkgName)
    }
    logger.debug(`No version annotation for package ${pkgName} in tag ${currentTag}`)

    const prevRef = `${currentTag}^`
    let refExists = false
    try {
      revParse(prevRef, config.cwd)
      refExists = true
    } catch (e) {}

    if (++depth < annotation_lookup_depth && refExists) {
      currentTag = lastReleaseTag(config, prevRef)
      logger.debug(`Try to found in previous release tag ${currentTag}`)
    } else {
      logger.warn(
        `Search annotated version in depth stopped,`,
        refExists ? `max depth "tagging.annotation_lookup_depth" = ${annotation_lookup_depth} is reached.` : `we reached the very first release tag which is the first commit at the same time, fetched to the working tree: ${currentTag}`
      )
      logger.warn(`Couldn't find annotated version for package ${pkgName}, last checked tag is ${currentTag}`)
      break
    }
  }
}
