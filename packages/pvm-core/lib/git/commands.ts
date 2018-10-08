import path from 'path'
import fs from 'fs'
import parseRepositoryUrl from '@hutson/parse-repository-url'
import gitUrlParse from 'git-url-parse'
import { wdShell } from '../shell'
import { escapeFilePath } from '../fs'
import revParse from './rev-parse'
import { CacheTag, taggedCacheManager, wdmemoize } from '../memoize'
import { releaseTagFilter } from '../tag-meta'

import type { Config } from '../config'
import { mergeBase } from './merge-base'
import { env } from '../env'
import { nthIndex } from '../text/index'

export {
  revParse,
}

export interface GetContentsOpts {
  ref?: string,
}

export function getContents(cwd: string, filePath: string, opts: GetContentsOpts = {}): string | null {
  const { ref = 'HEAD' } = opts
  try {
    return wdShell(cwd, `git cat-file -p ${ref}:"${filePath}"`)
  } catch (e) {
    return null
  }
}

export function getStagedFiles(cwd: string): string[] {
  const stagedFilesOutput = wdShell(cwd, `git diff --staged --diff-filter=ACMR --name-only`)
  if (stagedFilesOutput) {
    const stagedFiles = stagedFilesOutput.split('\n')
    if (stagedFiles.length && stagedFiles[stagedFiles.length - 1] === '') {
      stagedFiles.pop()
    }
    return stagedFiles
  }
  return []
}

export function indexFile(config: Config, filepath: string): void {
  const relativePath = path.isAbsolute(filepath) ? path.relative(config.cwd, filepath) : filepath
  wdShell(config.cwd, `git add ${escapeFilePath(relativePath)}`)
}

export function getCurrentBranchIgnoreEnv(cwd: string): string | undefined {
  const branchName = wdShell(cwd, `git rev-parse --abbrev-ref HEAD`)
  if (branchName === 'HEAD') {
    return void 0
  }
  return branchName
}

export function isTagAnnotated(cwd: string, tagName: string): boolean {
  return wdShell(cwd, `git rev-parse ${tagName}`) !== wdShell(cwd, `git rev-list -1 ${tagName}`)
}

export function getRefContent(cwd: string, ref: string): string {
  const refContent = wdShell(cwd, `git cat-file -p "${ref}"`)
  const slicePos = nthIndex(refContent, '\n', 5)

  return slicePos === -1 ? '' : refContent.slice(slicePos + 1)
}

export function getTagAnnotation(cwd: string, tagName: string): string {
  if (!isTagAnnotated(cwd, tagName)) {
    return ''
  }
  return getRefContent(cwd, tagName)
}

export interface GetRemoteUrlOpts {
  ignoreEnv?: boolean,
}

export function getRemoteUrl(cwd: string): string | void {
  const rootPkgPath = path.join(cwd, 'package.json')
  if (fs.existsSync(rootPkgPath)) {
    const rootPkg = JSON.parse(fs.readFileSync(rootPkgPath, { encoding: 'utf8' }))
    const repository = rootPkg?.repository
    if (repository) {
      return typeof repository === 'string' ? repository : repository.url
    }
  }

  try {
    return wdShell(cwd, `git remote get-url origin`)
  } catch (_ex) {
    // pass
  }
}

export function getHostUrl(cwd: string): string | void {
  const remoteUrl = getRemoteUrl(cwd)
  if (remoteUrl) {
    const domain = extractDomain(remoteUrl)
    if (domain) {
      return `https://${domain}`
    }
  }
}

export function extractDomain(url: string): string | null {
  try {
    const parsed = parseRepositoryUrl(url)
    if (parsed.domain && parsed.domain !== 'example.com') {
      return parsed.domain.split(':')[0]
    }
  } catch (e) {
    // pass
  }

  try {
    const parsed = gitUrlParse(url)
    if (parsed.resource) {
      return parsed.resource
    }
  } catch (ex) {
    return null
  }

  return null
}

export const isShallowRepository = wdmemoize((cwd: string): boolean => {
  const result = wdShell(cwd, 'git rev-parse --is-shallow-repository')
  if (result === '--is-shallow-repository') {
    return fs.existsSync(path.join(cwd, wdShell(cwd, 'git rev-parse --git-dir'), 'shallow'))
  }
  return result === 'true'
}, [CacheTag.gitFetchShallow])

export function gitAuthorDate(cwd: string, ref: string): Date {
  return new Date(wdShell(cwd, `git log -1 --format=%aI ${ref}`))
}

export const isTag = wdmemoize((cwd: string, ref: string): boolean => {
  try {
    wdShell(cwd, `git show-ref --tags ${ref}`)
    return true
  } catch (e) {
    return false
  }
}, [CacheTag.gitFetchTags])

export const isBranchExists = wdmemoize((cwd: string, branchName: string): boolean => {
  try {
    wdShell(cwd, `git show-ref --verify --quiet refs/heads/${branchName}`)
    return true
  } catch (e) {
    return false
  }
}, [CacheTag.gitFetch, CacheTag.gitBranches])

export const isRemoteBranchExists = wdmemoize((cwd: string, branchName: string): boolean => {
  try {
    wdShell(cwd, `git show-ref --verify --quiet refs/remotes/origin/${branchName}`)
    return true
  } catch (e) {
    return false
  }
}, [CacheTag.gitFetch, CacheTag.gitBranches])

export const getTagsPointsAt = wdmemoize((cwd: string, ref: string): string[] => {
  // eslint-disable-next-line pvm/no-direct-git-tag
  return wdShell(cwd, `git tag --points-at ${ref}`).split('\n').filter(x => x.length !== 0)
}, [CacheTag.gitFetchTags])

export const isWorkingDirectoryClean = (cwd: string): boolean => {
  return wdShell(cwd, `git status --porcelain`) === ''
}

export function getPersistentRef(config: Config, ref: string): string {
  const tagsPointsAt = getTagsPointsAt(config.cwd, ref)
  if (tagsPointsAt.length !== 0) {
    const filteredTags = tagsPointsAt.filter(releaseTagFilter(config))
    return filteredTags[0] || tagsPointsAt[0]
  }
  return revParse(ref, config.cwd)
}

export function getOldestDescendantCommitRef(cwd: string, currentBranch: string | undefined, targetRef: string): string {
  let noReleaseRef
  if (currentBranch === 'master') {
    if (env.PVM_TESTING_ENV) {
      noReleaseRef = wdShell(cwd, 'git rev-list --max-parents=0 HEAD')
    } else {
      const firstNoMergeCommit = wdShell(cwd, `git log --no-merges -1 --format=%H ${targetRef}`)
      try {
        noReleaseRef = wdShell(cwd, `git rev-parse ${firstNoMergeCommit}^`)
      } catch (ex) {
        // в репозитории только 1 коммит
        noReleaseRef = firstNoMergeCommit
      }
    }
  } else {
    noReleaseRef = mergeBase(cwd, 'origin/master', targetRef)
  }

  return noReleaseRef
}

export interface AddTagOptions {
  tagName: string,
  ref: string,
  annotation?: string | null,
}

export function deleteTag(cwd: string, tagName: string): void {
  // eslint-disable-next-line pvm/no-direct-git-tag
  wdShell(cwd, `git tag -d ${tagName}`)

  taggedCacheManager.clear(cwd, [CacheTag.gitFetchTags])
}

export function addTag(cwd: string, { tagName, ref, annotation }: AddTagOptions): void {
  if (!annotation) {
    // eslint-disable-next-line pvm/no-direct-git-tag
    wdShell(cwd, `git tag ${tagName} ${ref}`)
  } else {
    // eslint-disable-next-line pvm/no-direct-git-tag
    wdShell(cwd, `git tag --file=- ${tagName} ${ref}`, { input: annotation })
  }

  taggedCacheManager.clear(cwd, [CacheTag.gitFetchTags])
}

export interface FetchOptions {
  repo?: string,
  deepen?: number,
  tags?: boolean,
  refspec?: string,
}

export function gitFetch(cwd: string, { repo, deepen, tags, refspec }: FetchOptions = {}): void {
  // eslint-disable-next-line pvm/no-direct-git-fetch
  let cmd = `git fetch`

  if (repo) {
    cmd += ` ${repo}`
  }

  if (refspec) {
    cmd += ` ${refspec}`
  }

  if (deepen) {
    cmd += ` --deepen ${deepen}`
  }

  if (tags) {
    cmd += ` --tags`
  }

  wdShell(cwd, cmd)

  taggedCacheManager.clear(cwd, [CacheTag.gitBranches, CacheTag.gitFetchTags, CacheTag.gitFetch])
}
