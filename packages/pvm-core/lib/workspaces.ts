import fs from 'fs'
import path from 'path'
import glob from 'fast-glob'
import micromatch from 'micromatch'
import { wdShell } from './shell'

function getPkgDirPatterns(pkg): string[] {
  const { workspaces = [] } = pkg

  if (Array.isArray(workspaces)) {
    return workspaces
  }
  return workspaces.packages || []
}

const globOpts = {
  onlyFiles: true,
  ignore: ['**/node_modules/**'],
}

function joinPkgJson(p: string): string {
  let result = p
  if (!p.endsWith('/')) {
    result += '/'
  }
  return result + 'package.json'
}

enum WorkspacePatternsStatus {
  Ok,
  EndResult,
}

type WorkspacesPatternsResult = [WorkspacePatternsStatus.Ok | WorkspacePatternsStatus.EndResult, string[]]

function workspacePatternsFromManifest(pkg): WorkspacesPatternsResult {
  if (!pkg) {
    return [WorkspacePatternsStatus.EndResult, []]
  }
  if (!pkg.private) {
    // there is no monorepo, so only package that we may have is root one
    return [WorkspacePatternsStatus.EndResult, ['.']]
  }
  const patterns = getPkgDirPatterns(pkg)

  return [WorkspacePatternsStatus.Ok, patterns.map(p => joinPkgJson(p))]
}

function workspacePatternsFromFs(cwd = process.cwd()): WorkspacesPatternsResult {
  const pkgPath = path.join(cwd, 'package.json')
  let pkg
  try {
    pkg = JSON.parse(fs.readFileSync(pkgPath).toString('utf8'))
  } catch (e) {
    // pass
  }
  return workspacePatternsFromManifest(pkg)
}

function workspacePatternsFromRef(ref: string, cwd = process.cwd()): WorkspacesPatternsResult {
  let pkg
  try {
    const manifestStr = wdShell(cwd, `git show ${ref}:package.json`)
    pkg = JSON.parse(manifestStr)
  } catch (e) {
    // pass
  }

  return workspacePatternsFromManifest(pkg)
}

function resolvePkgList<T = string[]>(cwd: string, handler: (p: string[]) => T): T | string[] {
  const [status, result] = workspacePatternsFromFs(cwd)
  switch (status) {
    case WorkspacePatternsStatus.EndResult:
      return result
    case WorkspacePatternsStatus.Ok:
      return handler(result)
  }
}

function getWorkspacesSync(cwd = process.cwd()): string[] {
  return resolvePkgList(cwd, patterns => {
    return glob.sync(patterns, {
      ...globOpts,
      cwd,
    }).map(p => path.dirname(p))
  })
}

function getWorkspacesFromRef(ref: string, cwd = process.cwd()): string[] {
  const [status, patterns] = workspacePatternsFromRef(ref, cwd)
  if (status === WorkspacePatternsStatus.EndResult) {
    return patterns
  }

  const filesList = wdShell(cwd, `git ls-tree --name-only -r ${ref}`).split('\n')

  return micromatch(filesList, patterns).map(p => path.dirname(p))
}

// эта версия медленней
function getWorkspaces(cwd = process.cwd()): Promise<string[]> {
  return Promise.resolve(resolvePkgList<Promise<string[]>>(cwd, patterns => {
    return glob(patterns, {
      ...globOpts,
      cwd,
    }).then(files => files.map(p => path.dirname(p)))
  }))
}

export { getWorkspacesSync, getWorkspaces, getWorkspacesFromRef }
