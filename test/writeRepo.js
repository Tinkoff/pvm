// make repository by text spec
const fs = require('fs')
const path = require('path')
const { reposDir } = require('./repos-dir')

// makeRepo('any_name', 'src/a@1.0.0,src/b@1.0.0', { b: 'a'})

function splitPkgPath(pkgPath) {
  const firstIndexOfSlash = pkgPath.indexOf('/')
  return [
    pkgPath.substring(0, firstIndexOfSlash),
    pkgPath.substr(firstIndexOfSlash + 1),
  ]
}

function parseSpec({ name, version, spec, deps = {} }) {
  const rep = {
    packages: new Map(),
    name,
    version,
  }

  const packagesSpec = Array.isArray(spec) ? spec : spec.split(',')
  for (const pkgSpec of packagesSpec) {
    const [pkgPath, version] = pkgSpec.split('@')
    const [pkgDir, pkgName] = splitPkgPath(pkgPath)
    rep.workspaces = rep.workspaces || new Set()
    rep.workspaces.add(`${pkgDir}/*`)
    const pkg = {
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
    const pkg = rep.packages.get(pkgName)
    const deps = typeof depSpec === 'string' ? [depSpec] : depSpec

    const dependencies = {}

    for (const depName of deps) {
      if (!rep.packages.has(depName)) {
        throw new Error(`Invalided repo deps spec, there is no ${depName} package`)
      }
      dependencies[depName] = rep.packages.get(depName).version
    }

    pkg.dependencies = dependencies
  }

  return rep
}

function rootPkgTemplate(rep) {
  return JSON.stringify({
    name: rep.name,
    version: rep.version,
    private: rep.private !== undefined ? rep.private : rep.workspaces?.size,
    workspaces: rep.workspaces ? Array.from(rep.workspaces) : undefined,
  }, null, 2)
}

function pkgTemplate(pkg) {
  const json = {
    name: pkg.name,
    version: pkg.version,
    dependencies: pkg.dependencies || {},
  }

  return JSON.stringify(json, null, 2)
}

function mkdirp(dir) {
  fs.mkdirSync(dir, {
    recursive: true,
  })
}

function makeRepoByStructure(targetDir, rep) {
  fs.writeFileSync(path.join(targetDir, 'package.json'), rootPkgTemplate(rep))
  for (const pkg of rep.packages.values()) {
    mkdirp(path.join(targetDir, pkg.path))
    fs.writeFileSync(path.join(targetDir, pkg.path, 'package.json'), pkgTemplate(pkg))
  }
}

function takeDirAndMakeRepo(commonDir, rep) {
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
  } catch (e) {
    if (e.code === 'EEXIST') {
      return takeDirAndMakeRepo(baseName, rep)
    }
    throw e
  }

  makeRepoByStructure(repoDir, rep)
  return repoDir
}

function writeRepo(repoSpec) {
  const rep = parseSpec(repoSpec)
  return takeDirAndMakeRepo(reposDir, rep)
}

exports.writeRepo = writeRepo
