import chalk from 'chalk'
import micromatch from 'micromatch'
import glob from 'fast-glob'

import { getConfig } from '@pvm/core/lib/config'
import { Repository } from '@pvm/repository/lib'
import { PkgSet } from '@pvm/core/lib/pkg-set'

import { pkgsetAll } from '../pkgset-all'
import type { ChangedFilesOpts } from '../changed-files'
import { changedFiles } from '../changed-files'
import type { FromChangedFilesOpts } from '../from-changed-files'
import { pkgsetFromChangedFiles } from '../from-changed-files'

import fromGlobPatterns from '../from-glob-patterns'
import { describeStrategy } from '../utils/describe-strategy'

import type { Pkg } from '@pvm/core/lib/pkg'

export type PkgsetChangedOpts = ChangedFilesOpts & FromChangedFilesOpts & {
  ignoreDangerouslyOpts?: boolean,
}

const globOpts = {
  onlyFiles: true,
  ignore: ['**/node_modules/**'],
}

async function * pkgset(opts: PkgsetChangedOpts = {}): AsyncIterableIterator<Pkg> {
  const resultChanged = changedFiles(opts)
  let forceAllPackages = false
  const { ignoreDangerouslyOpts = false, cwd = process.cwd() } = opts
  const config = await getConfig(cwd)
  const repo = await Repository.init(cwd, { ref: resultChanged.targetLoadRef })

  const affectedConfig: { if_changed: string[], then_affected: string[] | '*' }[] = config.pkgset?.affected_files ?? []
  const resultPatterns: Set<string> = new Set()
  const changedPackages: Set<Pkg> = new Set()

  for (const { if_changed: changedPatterns, then_affected: relatedPatterns } of affectedConfig) {
    const normalizedPatterns = Array.isArray(relatedPatterns) ? relatedPatterns : [relatedPatterns]

    if (micromatch(resultChanged.files, changedPatterns).length) {
      if (normalizedPatterns.indexOf('*') !== -1) {
        forceAllPackages = true
        resultPatterns.clear()
        break
      }

      normalizedPatterns.forEach((p) => {
        resultPatterns.add(p)
      })
    }
  }

  if (resultPatterns.size) {
    resultChanged.files = [...new Set(resultChanged.files), ...glob.sync(Array.from(resultPatterns.values()), { ...globOpts, cwd })]
  }

  if (!ignoreDangerouslyOpts) {
    const always_changed_workspaces = config.dangerously_opts?.always_changed_workspaces || []

    if (always_changed_workspaces.length) {
      for (const extraPkg of fromGlobPatterns(config, always_changed_workspaces, void 0)) {
        changedPackages.add(extraPkg)
        yield extraPkg
      }
    }
  }

  const packagesIterator = forceAllPackages ? pkgsetAll(config, opts) : pkgsetFromChangedFiles(config, resultChanged, opts)

  for (const changed of packagesIterator) {
    if (changedPackages.has(changed)) {
      continue
    }

    changedPackages.add(changed)
    yield changed
  }

  for (const pkg of repo.getDependants(new PkgSet(changedPackages))) {
    if (changedPackages.has(pkg)) {
      continue
    }

    yield pkg
  }
}

describeStrategy(pkgset, 'affected', chalk`Prints packages which have been changed between two revisions.

    Options:
      {yellow include-root}: include root packages ? By default include if root package has version field, otherwise not.
      {yellow include-uncommited}: track uncommited changes too ? Default is false.
      {yellow ignore-dangerously-opts}: disable config flags in section "dangerously_opts".`)

export default pkgset
