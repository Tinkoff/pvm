import fs from 'fs'
import path from 'path'
import micromatch from 'micromatch'
import { logger } from '@pvm/core/lib/logger'
import { matchGroup } from '@pvm/core/lib/pkg-match'
import { releaseTypesInAscendingOrder, releaseTypes } from '@pvm/core/lib/semver-extra'
import { UpdateReasonType } from './update-state'

import type { PvmReleaseType } from '@pvm/core/types'
import type { Pkg } from '@pvm/core/lib/pkg'
import type { ForceReleaseState } from '../types'
import type { UpdateState } from './update-state'

const fileReleaseAliases = {
  skip: 'none',
}

const releaseTypesInDescOrderWithAliases: string[] = [...releaseTypesInAscendingOrder]
  .reverse()
  // @ts-ignore
  .concat(Object.keys(fileReleaseAliases))

function splitBy<T>(arr: T[], testFn: (x: T) => boolean): [Array<T>, Array<T>] {
  const left: T[] = []
  const right: T[] = []

  for (const x of arr) {
    if (testFn(x)) {
      right.push(x)
    } else {
      left.push(x)
    }
  }

  return [left, right]
}

interface ReleaseTypeOverride {
  type: PvmReleaseType,
  files_match: string[],
}

function overrideReleaseTypeByFiles(leftFiles: string[], releaseTypeOverrides: ReleaseTypeOverride[]): PvmReleaseType | undefined {
  let maybeReleaseType
  for (const override of releaseTypeOverrides) {
    const { files_match = [], type } = override
    if (!files_match.length) {
      continue
    }

    const matcher = (file: string) => micromatch.isMatch(file, files_match)

    const [ left, matched ] = splitBy(leftFiles, matcher)
    leftFiles = left
    if (matched.length) {
      maybeReleaseType = maybeReleaseType ? releaseTypes.max(maybeReleaseType, type) : type
      if (!left.length) {
        return maybeReleaseType
      }
    }
  }
}

export interface MarkReleaseTypeOpts {
  forceReleaseState?: ForceReleaseState,
  defaultReleaseType?: PvmReleaseType,
}

// Что хочется знать в причинах той или иной версии пакета в очередом релизе:
// 1. Менялся ли сам пакет вообще, или нет. Другими словами версия поднялась из-за изменений в пакете, или по другим причинам. Здесь три градации:
// 1. 1. Пакет менялся
// 1. 2. Пакет изменился из-за обновления зависимостей
// 1. 3. Пакет изменился по другим причинам
// 2. Независимо от пункта выше, если возможно вычислить какая была причина релиза пакета: версия была установлена вручную, или это был новый пакет, или были какие управляющие конструкции.
// В данной функции может быть дан ответ только на второй ответ для заданного пакета, т.к. она только часть процесса выставления новой версии для пакета
export async function markReleaseType(pkg: Pkg, updateState: UpdateState, opts: MarkReleaseTypeOpts = {}): Promise<void> {
  const { defaultReleaseType = 'minor' } = opts
  const { update: updateConfig } = updateState.repo.config
  const { changedContext } = updateState
  const { hints } = updateState.updateContext

  let releaseType: PvmReleaseType | null | undefined = null
  const hostApi = await updateState.repo.getHostApi()
  let updateReasonType: UpdateReasonType = UpdateReasonType.unknown

  const prevVersion = changedContext.getPrevVersion(pkg.name)

  if (typeof prevVersion === 'string' && pkg.version !== prevVersion) {
    logger.log(`version for package ${pkg.name} was set manually, keep it as is`)
    releaseType = 'none'
    updateReasonType = UpdateReasonType.manually_set
  }

  if (!releaseType && updateConfig.workspace_release_files) {
    const updated = releaseTypesInDescOrderWithAliases.some(fileName => {
      const releaseFile = path.join(pkg.absPath, fileName)
      if (fs.existsSync(releaseFile)) {
        releaseType = fileReleaseAliases[fileName] || fileName

        updateState.releaseFilesMap.set(pkg, fileName)
        return true
      }
      return false
    })
    if (updated) {
      updateReasonType = UpdateReasonType.workspace_file
    }
  }

  // pass to guessing to plugins if changedContext is present
  if (!releaseType && changedContext) {
    releaseType = await hostApi.releaseType(pkg, changedContext)
    if (releaseType) {
      updateReasonType = UpdateReasonType.by_plugin
    }
  }

  if (!releaseType && hints['release-types']) {
    releaseType = matchGroup(pkg, hints['release-types'] || {})
    if (releaseType) {
      logger.debug(`${pkg.name}: matched ${releaseType || 'no'} release type from release-types config`)
      updateReasonType = UpdateReasonType.hints
    }
  }

  if (!releaseType && !prevVersion) {
    logger.log(`package ${pkg.name} has been added, keep version as is if possible`)
    releaseType = 'none'
    updateReasonType = UpdateReasonType.new
    updateState.newPackages.add(pkg)
  }

  // process release_type_overrides
  if (!releaseType && updateConfig.release_type_overrides && updateConfig.release_type_overrides.length && changedContext) {
    releaseType = overrideReleaseTypeByFiles(changedContext.getChangedFilesFor(pkg.name), updateConfig.release_type_overrides)
    if (releaseType) {
      updateReasonType = UpdateReasonType.release_type_overrides
    }
  }

  if (!releaseType) {
    const commits = await changedContext.pkgCommitsFor(pkg.name)
    if (commits.length) {
      const maybeReleaseType = await hostApi.releaseTypeByCommits(commits)
      if (maybeReleaseType) {
        releaseType = maybeReleaseType
        updateReasonType = UpdateReasonType.by_commits
      }
    }
  }

  if (!releaseType) {
    releaseType = opts.forceReleaseState && opts.forceReleaseState.packages.has(pkg) ? opts.forceReleaseState.defaultReleaseType : defaultReleaseType
    if (updateState.alwaysChangedPackages.has(pkg)) {
      updateReasonType = UpdateReasonType.always_changed
    } else if (opts.forceReleaseState && opts.forceReleaseState.packages.has(pkg)) {
      updateReasonType = UpdateReasonType.hints
    } else if (updateState.changedContext.packages.has(pkg)) {
      updateReasonType = UpdateReasonType.changed
    } else {
      updateReasonType = UpdateReasonType.unknown
    }
  }

  if (!updateState.updateReasonMap.has(pkg)) {
    updateState.updateReasonMap.set(pkg, updateReasonType)
  }

  if (releaseType) {
    if (updateConfig.respect_zero_major_version) {
      releaseType = decreaseReleaseTypeForPackagesWithZeroMajorVersion(pkg.version, releaseType)
    }
    updateState.wantedReleaseTypes.set(pkg, releaseType)
  }
}

export function decreaseReleaseTypeForPackagesWithZeroMajorVersion(pkgVersion: string, releaseType: PvmReleaseType): PvmReleaseType {
  const pkgWithZeroMajorVersion = typeof pkgVersion === 'string' && pkgVersion.startsWith('0.')

  if (pkgWithZeroMajorVersion) {
    if (releaseType === 'major') {
      releaseType = 'minor'
    } else if (releaseType === 'minor') {
      releaseType = 'patch'
    }
  }

  return releaseType
}
