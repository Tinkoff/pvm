// make repository by text spec
import fs from 'fs'
import path from 'path'
// @ts-ignore
import { reposDir } from './repos-dir'
import type { PkgPath, PkgSpec, PkgVersion, Repo, RepoPkg, RepoSpec } from './types'

// makeRepo('any_name', 'src/a@1.0.0,src/b@1.0.0', { b: 'a'})

function splitPkgPath(pkgPath: string): [string, string] {
  const firstIndexOfSlash = pkgPath.indexOf('/')
  return [
    pkgPath.substring(0, firstIndexOfSlash),
    pkgPath.substr(firstIndexOfSlash + 1),
  ]
}

function parseSpec({ name, version, spec, deps = {} }: RepoSpec): Repo {
  const rep: Repo = {
    packages: new Map(),
    name,
    version,
    workspaces: new Set(),
  }

  const packagesSpec = (Array.isArray(spec) ? spec : spec.split(',')) as PkgSpec[]
  for (const pkgSpec of packagesSpec) {
    const [pkgPath, version] = pkgSpec.split('@') as [PkgPath, PkgVersion]
    const [pkgDir, pkgName] = splitPkgPath(pkgPath)
    rep.workspaces.add(`${pkgDir}/*`)
    const pkg: RepoPkg = {
      name: pkgName,
      path: pkgPath,
      version,
    }
    rep.packages.set(pkgName, pkg)
  }

  for (const [pkgName, depSpec] of Object.entries(deps)) {
    if (!rep.packages.has(pkgName)) {
      throw new Error(`Invalided repo deps spec, there is no ${pkgName} package`)
    }
    const pkg = rep.packages.get(pkgName)!
    const deps = typeof depSpec === 'string' ? [depSpec] : depSpec

    const dependencies: RepoPkg['dependencies'] = {}

    for (const depName of deps) {
      if (!rep.packages.has(depName)) {
        throw new Error(`Invalided repo deps spec, there is no ${depName} package`)
      }
      dependencies[depName] = rep.packages.get(depName)!.version
    }

    pkg.dependencies = dependencies
  }

  return rep
}

function rootPkgTemplate(rep: Repo) {
  return JSON.stringify({
    name: rep.name,
    version: rep.version,
    private: rep.private !== undefined ? rep.private : rep.workspaces?.size,
    workspaces: rep.workspaces ? Array.from(rep.workspaces) : undefined,
  }, null, 2)
}

function pkgTemplate(pkg: RepoPkg) {
  const json = {
    name: pkg.name,
    version: pkg.version,
    dependencies: pkg.dependencies || {},
  }

  return JSON.stringify(json, null, 2)
}

function mkdirp(dir: string) {
  fs.mkdirSync(dir, {
    recursive: true,
  })
}

function makeRepoByStructure(targetDir: string, rep: Repo) {
  fs.writeFileSync(path.join(targetDir, 'package.json'), rootPkgTemplate(rep))
  for (const pkg of rep.packages.values()) {
    mkdirp(path.join(targetDir, pkg.path))
    fs.writeFileSync(path.join(targetDir, pkg.path, 'package.json'), pkgTemplate(pkg))
  }
}

function takeDirAndMakeRepo(commonDir: string, rep: Repo): string {
  const baseName = rep.name
  let name = baseName
  let repoDir = `${commonDir}/${name}`
  let i = 1
  while (fs.existsSync(repoDir)) {
    name = `${baseName}_${i++}`
    repoDir = `${commonDir}/${name}`
  }
  try {
    fs.mkdirSync(repoDir, {
      recursive: true,
    })
  } catch (e: unknown) {
    if ((e as { code?: string }).code === 'EEXIST') {
      return takeDirAndMakeRepo(baseName, rep)
    }
    throw e
  }

  makeRepoByStructure(repoDir, rep)
  return repoDir
}

export function writeRepo(repoSpec: RepoSpec) {
  const rep = parseSpec(repoSpec)
  return takeDirAndMakeRepo(reposDir, rep)
}
