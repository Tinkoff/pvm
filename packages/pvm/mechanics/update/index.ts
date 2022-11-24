import semver from 'semver'
import chalk from 'chalk'
import { processForceRelease, enrichByDependants } from './enrich-from-hints'
import getUpdateContext from './update-context'
import { log, logger } from '../../lib/logger'
import * as makeRelease from './update-methods/release'
import type { SinceLastReleaseOpts } from './strategies/since-last-release'
import sinceLastRelease from './strategies/since-last-release'
import { markReleaseType } from './pkg-release-type'
import { createReleaseContext } from './release/release-context'

import { Repository } from '../repository'
import { UpdateReasonType, UpdateState } from './update-state'
import { vcsInitForUpdate } from './vcs-init'
import getTemplateEnv from '../template/env'
import { Notificator } from '../notifications'

import type { Pkg } from '../../lib/pkg'
import type { ReleaseContext, ForceReleaseState, UpdateMethod, CliUpdateOpts } from './types'
import type { PvmReleaseType } from '../../types'
import type { ChangedContext } from './changed-context'
import type { Container } from '../../lib/di'

import { env } from '../../lib/env'
import { CONFIG_TOKEN, CWD_TOKEN } from '../../tokens'

async function markReleaseTypes(updateState: UpdateState, forceReleaseState: ForceReleaseState): Promise<void> {
  let packagesForMark = updateState.changedContext.packages

  packagesForMark = packagesForMark
    .asMut()
    .addIterable(updateState.alwaysChangedPackages)
    .addIterable(forceReleaseState.packages)
    .freeze()

  for (const pkg of packagesForMark) {
    await markReleaseType(pkg, updateState, {
      defaultReleaseType: updateState.repo.config.update.default_release_type,
      forceReleaseState,
    })
  }
}

async function generateNotes(updateState: UpdateState): Promise<void> {
  const { packages } = updateState.changedContext
  const hostApi = await updateState.repo.getHostApi()
  for (const pkg of packages) {
    const commits = await updateState.changedContext.pkgCommitsFor(pkg.name)
    if (commits && commits.length) {
      logger.debug(`(${pkg.name}) generate release notes`)

      const md = await hostApi.commitsToNotes(commits, pkg)
      logger.debug(`release notes for ${pkg.name}:\n${md.substr(0, 100)}..`)
      updateState.releaseNotes.set(pkg, md)
    }
  }
}

export interface MakeUpdateStateOptions {
  readonly?: boolean,
}

async function makeUpdateState(di: Container, changedContext: ChangedContext, opts: MakeUpdateStateOptions = {}): Promise<UpdateState> {
  const repo = await Repository.init(di, {
    ref: changedContext.targetLoadRef,
  })

  const updateContext = await getUpdateContext(repo)
  logger.debug('update hints', updateContext.hints)

  const updateState = new UpdateState(repo, changedContext, updateContext)

  const packages = changedContext.packages
  logger.debug('list of changed packages:\n', packages.map(pkg => pkg.name).join('\n'))

  if (!opts.readonly) {
    await generateNotes(updateState)
  }

  const forceReleaseState = await processForceRelease(updateState)

  // Выставляем релизные типы на основе факта изменений пакетов и других условий
  await markReleaseTypes(updateState, forceReleaseState)

  // дальнейший алгоритм:
  // 1. проходим по депендантам, и для них, если еще не выставлен release type, выставляем согласно настройкам (обычно patch)
  // 2. берем Unified Groups, и для каждой определяем две переменные:
  // 2. 1) max release type
  // 2. 2) base version
  // 3. Применяем max release type к base version и выставляем получившиюся версию для всех пакетов в группе
  // 4. Повторяем п.1 пока не будет новых изменившихся пакетов

  let packagesNeedsEnrichedForDependants: Iterable<Pkg> = updateState.aboutToChange()
  while (true) {
    await enrichByDependants(repo, updateState, packagesNeedsEnrichedForDependants)
    const newByUnifiedGroups = await processUnifiedGroups(repo, updateState)
    packagesNeedsEnrichedForDependants = newByUnifiedGroups

    if (newByUnifiedGroups.length === 0) {
      break
    }
  }

  const result = await updateState.finalize()
  logger.debug(
    'packages for release:\n',
    Array.from(updateState.getReleasePackages().values()).map(pkg => `${pkg.name}@${pkg.version}`).join('\n')
  )

  return result
}

export interface GetUpdateStateOpts extends SinceLastReleaseOpts {
  readonly?: boolean,
  targetRef?: string,
}

async function getUpdateState(di: Container, opts: GetUpdateStateOpts = {}): Promise<UpdateState> {
  const cwd = opts.cwd || di.get(CWD_TOKEN)// @TODO: задепрекейтить process.cwd() здесь
  const { targetRef = 'HEAD' } = opts

  const changedContext = await sinceLastRelease(di, targetRef, {
    ...opts,
    cwd,
  })

  return await makeUpdateState(di, changedContext, { readonly: opts.readonly })
}

function printPackagesLimited(pkgList: Iterable<Pkg>, maxLength = 45): string {
  const result: string[] = []
  let cc = 0
  for (const pkg of pkgList) {
    const shortName = pkg.shortName
    result.push(shortName)
    cc += shortName.length
    if (cc >= maxLength) {
      break
    }
  }
  let str = result.join(', ')
  if (str.length > maxLength) {
    str = str.substr(0, maxLength) + '..'
  }
  return str
}

async function processUnifiedGroups(repo: Repository, updateState: UpdateState): Promise<Pkg[]> {
  const unifiedGroups = repo.unifiedGroupsMWR
  const newUpdatedPackages: Pkg[] = []

  let ugIndex = 0
  // const lastReleaseTag = repo.getLastReleaseTag(updateState.changedContext.targetRef)
  for (const unifiedGroup of unifiedGroups.unifiedList) {
    // логика здесь должна оставаться идемпотентна, т.к. вызывается несколько раз
    // if (!unifiedGroup.size || updateState.newVersions.has(unifiedGroup.toArray()[0])) {
    //   continue
    // }
    // способ несколько наивный, и будет не оптимально повышать если версии пакетов в группе разнятся
    // но это довольно редкий кейс, актуален только когда пакеты только переходят в группу
    const baselineVersion = updateState.getBaselineVersion(unifiedGroup)
    logger.log(`UnifiedGroup #${ugIndex}: ${printPackagesLimited(unifiedGroup, 100)}`)
    logger.log(`UnifiedGroup #${ugIndex}, baselineVersion is: ${baselineVersion}`)
    const releaseType: PvmReleaseType | null = updateState.calcGroupReleaseType(unifiedGroup, baselineVersion)
    logger.log(`UnifiedGroup #${ugIndex}, calculated release type is: ${releaseType}`)

    const newVersion = releaseType && releaseType !== 'none' ? semver.inc(baselineVersion, releaseType)! : baselineVersion
    logger.log(`UnifiedGroup #${ugIndex}, new version is: ${newVersion}`)
    for (const pkg of unifiedGroup) {
      const hasNewVersion = pkg.version !== newVersion
      const isNewPkg = updateState.newPackages.has(pkg)
      if (hasNewVersion || isNewPkg) {
        if (!updateState.hasNewVersionOrReleaseType(pkg)) {
          newUpdatedPackages.push(pkg)
        }
        // ставим в причину релиза unified т.к. он имеет самый высокий приоритет
        // при условии что сам пакет не менялся
        if (!updateState.isPkgChanged(pkg.name) || !updateState.updateReasonMap.has(pkg)) {
          // hints имеет приоритет все же выше @TODO: нужен нормальный пайплайн принятия решения по версии для пакета, текущая реализация
          // перегружена с точки зрения ответа на вопрос: почему та или иная версия была присвоена пакету
          if (updateState.updateReasonMap.get(pkg) !== UpdateReasonType.hints) {
            updateState.updateReasonMap.set(pkg, UpdateReasonType.unified)
          }
        }
        updateState.newVersions.set(pkg, newVersion)
      } else if (updateState.wantedReleaseTypes.has(pkg)) {
        // поидее метод calcGroupReleaseType выше уже должен был предусмотреть все кейсы wantedReleaseTypes
        // и этот код не должен исполнится
        // но на всякий случай, удалим из wantedReleaseTypes т.к. это приведет к рассинхрону позже в методе updateState.finalize
        // в целом здесь нужно в целом пересмотреть модель и логику выставления версий с учетом UG
        logger.warn(
          `Wanted release type ${updateState.wantedReleaseTypes.get(pkg)} for package "${pkg.name}" but UG logic left the package version as is.`
        )
        updateState.wantedReleaseTypes.delete(pkg)
      }
    }
    ugIndex++
  }
  return newUpdatedPackages
}

interface MakeReleaseContextOpts {
  cwd?: string,
}

async function makeReleaseContext(di: Container, targetRef: string | undefined = void 0, opts: MakeReleaseContextOpts = {}): Promise<ReleaseContext | null> {
  return createReleaseContext(await getUpdateState(di, {
    ...opts,
    targetRef,
  }))
}

async function updateWithVcsRetry<R>(di: Container, updateMethod: UpdateMethod<R>, opts: CliUpdateOpts | undefined = void 0): Promise<R> {
  const config = di.get(CONFIG_TOKEN)
  const { commit_via_platform, retry_via_platform_if_failed_via_vcs = true } = config.update
  const dryRun = opts?.dryRun || false
  try {
    return await update(di, updateMethod, opts)
  } catch (e) {
    if (e.context === 'push' && !commit_via_platform && retry_via_platform_if_failed_via_vcs) {
      logger.warn(`PVM has failed to push a release commit via git:\n${e.message}\n Retrying release attempt using platform api now!`)
      const templateEnv = await getTemplateEnv(di)
      const notifyMessage = templateEnv.render('failed_vcs_push', {
        CI_PIPELINE_URL: env.CI_PIPELINE_URL,
      })
      if (!dryRun) {
        const messenger = new Notificator(di.get(CONFIG_TOKEN))
        await messenger.sendMessage({
          content: notifyMessage,
          attachments: [
            {
              title: 'Push error',
              text: e.message,
            },
          ],
        }).catch(e => logger.error(e))
      } else {
        logger.log(`DRY RUN: send message:\n${notifyMessage}`)
      }
      // попытка номер два, запушить через платформу
      // @ts-ignore @TODO: упростить метод update с точки зрения типов, убрать генерик на опции
      return await update(di, updateMethod, {
        ...opts,
        vcsMode: 'platform',
      })
    } else {
      throw e
    }
  }
}

async function update<R>(di, updateMethod: UpdateMethod<R>, opts: CliUpdateOpts = {}): Promise<R> {
  // @ts-ignore
  if (opts && opts.dryRun) {
    log(chalk`{yellowBright DRY RUN}`)
  }

  const config = di.get(CONFIG_TOKEN)

  const vcs = await vcsInitForUpdate(di, {
    ...opts,
    cwd: config.cwd,
  })

  if (updateMethod.prepare) {
    await updateMethod.prepare(config, vcs)
  }

  const updateState = await getUpdateState(di, { cwd: config.cwd })
  return updateMethod.run(di, updateState, vcs, opts)
}

function release(di: Container): ReturnType<typeof makeRelease.run> {
  return updateWithVcsRetry(di, makeRelease, void 0)
}

export {
  getUpdateState,
  makeUpdateState,
  updateWithVcsRetry as update,
  release,
  makeReleaseContext,
}
