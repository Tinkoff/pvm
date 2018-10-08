import fs from 'fs'
import path from 'path'
import semver from 'semver'

import { isStubVersion } from '@pvm/core/lib/tag-meta'
import { loggerFor } from '@pvm/core/lib/logger'
import { versioningFile } from '@pvm/core/lib/dedicated-versions-file'
import { indexFile } from '@pvm/core/lib/git/commands'
import { enpl } from '@pvm/core/lib/text/plural'

import type { Repository } from './repository'

import type { Pkg } from '@pvm/core/lib/pkg'
import type { Config } from '@pvm/core/lib/config'

export interface LintOptions {
  fix?: boolean,
  index?: boolean,
}

const logger = loggerFor('pvm:lint')

// для критических случаев когда валидировать дальше нет смысла
class ValidationError extends Error {}

interface LintResult {
  errors: string[],
}

interface FixerContext {
  newMetaVersions: Map<Pkg, string>, // версии которые нужно подправить именно в package.json пакета
  stubVersion: string,
  versioningFileDiff: Record<string, string | undefined>,
  needIndex: boolean,
}

interface ReportData {
  message: string,
  fix?(ctx: FixerContext): void,
}

interface LinterContext {
  repo: Repository,
  config: Config,
  report(data: ReportData): void,
}

interface LintPkgRule {
  validate(pkg: Pkg, linter: LinterContext): void,
}

interface LintRepoRule {
  validate(repo: Repository, linter: LinterContext): void,
}

const pkgVersioningRule: LintPkgRule = {
  validate(pkg: Pkg, linter: LinterContext): void {
    const { config } = linter
    if (!pkg.meta.version) {
      linter.report({
        message: `Package ${pkg.path} has no version`,
        fix(fixer: FixerContext) {
          const fixVersion = config.versioning.source === 'package' ? '0.0.1' : fixer.stubVersion
          logger.info(`Add version "${fixVersion}" for "${pkg.path}" package`)
          fixer.newMetaVersions.set(pkg, fixVersion)
        },
      })
      // дальше версию не проверяем, т.к. ее изначально и не было
      return
    }

    if (config.versioning.source !== 'package') {
      if (!isStubVersion(pkg.meta.version)) {
        linter.report({
          message: `package ${pkg.path} has incorrect version ${pkg.meta.version} for dedicated versioning. Correct version would be 0.0.0-<placeholder> for example 0.0.0-stub`,
          fix(fixer: FixerContext) {
            logger.info(`Rewrite version for "${pkg.path}" package.json from "${pkg.meta.version}" to "${fixer.stubVersion}"`)
            fixer.newMetaVersions.set(pkg, fixer.stubVersion)
          },
        })
      }
    }
  },
}

const versionsFileGeneralRule: LintRepoRule = {
  validate(repo: Repository, linter: LinterContext) {
    const { config } = repo
    const { versioning } = config
    if (versioning.source !== 'file') {
      return
    }

    if (!versioning.source_file) {
      throw new ValidationError(`You should set up "versioning.source_file" setting, in case you have "versioning.source" = "file"`)
    }

    const resolvedPath = path.resolve(repo.config.cwd, versioning.source_file)

    if (!fs.existsSync(resolvedPath)) {
      linter.report({
        message: `Versioning file ${versioning.source_file} doesn't exist.`,
        fix(fixer) {
          const versionsMap = repo.getVersionsMap(true)
          const packagesCountDesc = enpl(['%1 packages', '%1 package', '%1 packages'], Object.keys(versionsMap).length)
          logger.info(`Creating ${versioning.source_file} file for ${packagesCountDesc}.`)
          versioningFile.save(repo.config, versionsMap, fixer.needIndex)
        },
      })
    }

    const versionsRecord = versioningFile.load(repo.config)
    // проверяем что нет лишних записей
    for (const pkgName of Object.keys(versionsRecord)) {
      if (!repo.pkgset.has(pkgName)) {
        linter.report({
          message: `Useless entry: package ${pkgName} not exists in repository, but exists in the ${config.versioning.source_file} list.`,
          fix(fixer) {
            logger.info(
              `Removing redundant version matching for "${pkgName}" package from ${config.versioning.source_file} file. \
Version was "${versionsRecord[pkgName]}".`
            )
            fixer.versioningFileDiff[pkgName] = void 0
          },
        })
      }
    }
  },
}

const versionsFileNoStubs: LintRepoRule = {
  validate(repo: Repository, linter: LinterContext) {
    const { config } = repo
    const { versioning } = config
    if (versioning.source !== 'file') {
      return
    }

    const versionsRecord = versioningFile.load(repo.config)

    if (versionsRecord) {
      for (const pkgName of Object.keys(versionsRecord)) {
        const version = versionsRecord[pkgName]

        if (isStubVersion(version)) {
          linter.report({
            message: `Package ${pkgName} has stub version ${version} in the "${config.versioning.source_file}" file. Stub versions are now allowed there.`,
            fix(fixer) {
              const repoPkg = repo.pkgset.get(pkgName)
              if (!repoPkg) {
                throw new Error(`Unable to fix package ${pkgName}: there is no such package`)
              }
              const newVersion = repoPkg.version
              if (isStubVersion(newVersion)) {
                throw new Error(
                  `Fatal error: pvm returns stub version for package ${pkgName} for publishing purposes, which is illegal.`
                )
              }
              logger.info(`Rewrite version for "${pkgName}" to ${newVersion}.`)
              fixer.versioningFileDiff[pkgName] = newVersion
            },
          })
        }
      }
    }
  },
}

const versionsFileMissingRule: LintPkgRule = {
  validate(pkg: Pkg, linter: LinterContext): void {
    const { config } = linter
    if (config.versioning.source !== 'file') {
      return
    }

    if (!versioningFile.lookupPkgVersion(pkg)) {
      linter.report({
        message: `Package ${pkg.path} is not in the ${config.versioning.source_file} list.`,
        fix(fixer) {
          const newVersion = !pkg.meta.version || isStubVersion(pkg.meta.version) ? '0.0.1' : pkg.meta.version || '0.0.1'
          logger.info(`Adding ${pkg.name}@${newVersion} entry to ${config.versioning.source_file} file.`)
          fixer.versioningFileDiff[pkg.name] = newVersion
        },
      })
    }
  },
}

interface RulesDeclaration {
  repo: LintRepoRule[],
  pkg: LintPkgRule[],
}

const rules: RulesDeclaration = {
  repo: [
    versionsFileGeneralRule,
    versionsFileNoStubs,
  ],
  pkg: [
    pkgVersioningRule,
    versionsFileMissingRule,
  ],
}

export function lint(repo: Repository, opts: LintOptions = {}): LintResult {
  const { versioning } = repo.config
  const { fix = false, index = false } = opts
  const result: LintResult = {
    errors: [],
  }

  const newMetaVersions = new Map<Pkg, string>()
  const fixer: FixerContext = {
    newMetaVersions,
    stubVersion: `0.0.0-stub`,
    versioningFileDiff: Object.create(null),
    needIndex: index,
  }

  const linterCtx: LinterContext = {
    repo,
    config: repo.config, // alias
    report(data: ReportData) {
      if (fix && data.fix) {
        data.fix(fixer)
      } else {
        result.errors.push(data.message)
      }
    },
  }

  for (const repoRule of rules.repo) {
    repoRule.validate(repo, linterCtx)
  }

  let stubVersionFound = false
  for (const pkg of repo.pkgset) {
    if (pkg.meta.version && isStubVersion(pkg.meta.version) && !stubVersionFound) {
      const parsedVersion = semver.parse(pkg.meta.version)
      if (parsedVersion && parsedVersion.prerelease.length) {
        fixer.stubVersion = `0.0.0-${String(parsedVersion.prerelease[0]) || 'stub'}`
        stubVersionFound = true
      }
    }
    for (const pkgRule of rules.pkg) {
      pkgRule.validate(pkg, linterCtx)
    }
  }

  if (fix) {
    if (versioning.source === 'file') {
      if (Object.keys(fixer.versioningFileDiff).length > 0) {
        const currentVersions = versioningFile.load(repo.config) || {}
        const newVersions = Object.assign(currentVersions, fixer.versioningFileDiff)

        // undefined значения в ключах автоматически удалятся при привидении к JSON-строке
        versioningFile.save(repo.config, newVersions, index)
        for (const pkgName of Object.keys(fixer.versioningFileDiff)) {
          if (repo.pkgset.has(pkgName)) {
            repo.pkgset.get(pkgName)!.resetLazyForVersion()
          }
        }
      }
    }
    if (newMetaVersions.size) {
      const appliedPkgset = repo.applyVersions(newMetaVersions, {
        updateDependantsVersion: versioning.source === 'package',
      })

      for (const pkg of appliedPkgset) {
        pkg.save()
        if (index) {
          indexFile(repo.config, path.join(pkg.path, 'package.json'))
        }
      }
    }
  }

  return result
}
