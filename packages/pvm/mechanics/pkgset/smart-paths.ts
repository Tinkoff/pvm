// /foo/bar -- match from workspace root
// :package.json -- match from any package base path
// <rest> -- micromatch against full repo path with matchBase: false option

import micromatch from 'micromatch'

function workspaceExclude(sortedWorkspaces: string[], fileList: string[], pattern: string): string[] {
  const patterns = sortedWorkspaces.map(pkgPath => `${pkgPath}/${pattern}`)

  return micromatch.not(fileList, patterns)
}

function rootExclude(fileList: string[], patterns: string[]): string[] {
  if (patterns.length === 0) {
    return fileList
  }
  const fileListWithLeadingSlash = fileList.map(f => `/${f}`)

  return micromatch.not(fileListWithLeadingSlash, patterns).map(f => f.substr(1))
}

export function exclude(sortedWorkspaces: string[], fileList: string[], ignorePatterns: string[]): string[] {
  let result = fileList
  const workspacePatterns: string[] = []
  const rootPatterns: string[] = []
  const restPatterns: string[] = []

  for (const pattern of ignorePatterns) {
    if (pattern.startsWith(':')) {
      workspacePatterns.push(pattern)
    } else if (pattern.startsWith('/')) {
      rootPatterns.push(pattern)
    } else {
      restPatterns.push(pattern)
    }
  }

  for (const pattern of workspacePatterns) {
    result = workspaceExclude(sortedWorkspaces, result, pattern.substr(1))
  }
  result = rootExclude(result, rootPatterns)
  result = micromatch.not(result, restPatterns)

  return result
}
