import fs from 'fs'
import os from 'os'
import chalk from 'chalk'
import vm from 'vm'

import micromatch from 'micromatch'
import semver from 'semver'
import pMap from 'p-map'
import defaults from 'lodash/defaults'
import mapValues from 'lodash/mapValues'

import { getHostApi } from '@pvm/core/lib/plugins'
import { parseSubArgs } from '@pvm/core/lib/text/sub-args'
import runShell from '@pvm/core/lib/shell/run'
import execShell from '@pvm/core/lib/shell/exec'
import shell from '@pvm/core/lib/shell'
import type { Config } from '@pvm/core/lib/config'
import { getConfig } from '@pvm/core/lib/config'
import drainItems from '@pvm/core/lib/iter/drain-items'
import { lastReleaseTag } from '@pvm/core/lib/git/last-release-tag'
import { getReleaseCommits } from '@pvm/core/lib/git/release-commits'
import { enpl } from '@pvm/core/lib/text/plural'
import { matchAny } from '@pvm/core/lib/pkg-match'
import revParse from '@pvm/core/lib/git/rev-parse'

import { pkgset } from '@pvm/pkgset'
import { Notificator } from '@pvm/notifications'
import { Repository } from '@pvm/repository/lib'
import { buildDependantPackagesListIntoTree, visitDependantPackagesTree } from '@pvm/repository/lib/dependent-packages'

import { setupPublishNpmRCAndEnvVariables } from './prepare'
import type { Flags } from './flags'
import { flagsBuilder } from './flags'
import { releaseMessage } from './release-message'
import { createBufferedLogger, logger, printBufferedLogger } from './logger'
import {
  createErrorStats,
  createSkippedStats,
  createSuccessStats,
  printPublishedSummary,
  printUnpublishedSummary, pushPkgStats,
  sortPublishedStats,
} from './publish-stats'
import commits from '@pvm/core/lib/git/commits'
import { PkgSet } from '@pvm/core/lib/pkg-set'
import { BasicPublishApplier } from './publish-applier/basic'
import { CanaryPublishApplier } from './publish-applier/canary'

import type { PkgFailStats, PkgSuccessStats, PkgSkippedStats, PublishedStats } from '@pvm/types'
import type { Pkg } from '@pvm/core/lib/pkg'
import { getPassedRegistry, getPkgRegistry } from './registry'
import type { AbstractPublishApplier } from './publish-applier/abstract'
import { env } from '@pvm/core/lib/env'

const defaultConcurrency = 1

const {
  PVM_TESTING_ENV,
  PVM_EXTERNAL_DRY_RUN,
  PVM_FORCE_TEST_PUBLISH,
} = env

export async function publish(flags: Flags): Promise<PublishedStats> {
  const skipRealPublishing = isSkipRealPublishing(flags)
  const cwd = process.cwd()
  let config = await getConfig(cwd)
  const ref = revParse('HEAD', cwd)

  flags = applyFlagsDefaultsForUnification(flags)
  config = applyFlagsToConfig(config, flags)
  await initPlugins(cwd)

  logger.info(`publishing packages..`)
  if (skipRealPublishing) {
    if (PVM_TESTING_ENV) {
      logger.log(chalk`{yellow DRY RUN due to testing env!}`)
    } else {
      logger.warn(chalk`{yellow DRY RUN!}`)
    }
  }

  const publishedPkgsStats: PublishedStats = {
    success: [],
    error: [],
    skipped: [],
  }
  const passedRegistry: string | undefined = getPassedRegistry(flags, config)

  let concurrency = flags.concurrency === undefined ? os.cpus().length : Number(flags.concurrency)
  if (!isFinite(concurrency)) {
    concurrency = defaultConcurrency
  }

  // filter нужен т.к. не все пакеты могут присутствовать исходя из переданной стратегии
  // например в тестовых целях в мерж-реквесте запускают публикацию всех зарелиженных пакетов
  // но при этом в мерж-реквесте один из пакетов удаляют, соответственно, он будет присутствовать в pkgset,
  // но в актуальном worktree его уже не будет
  const pkgsetPackages = (await drainItems(pkgset(flags.strategy, {
    ...parseSubArgs(flags.strategyOption),
    registry: passedRegistry,
  })))

  /**
   * Костыль для сохранения консистентности по ref в возвращаемом pkgset и в Repository при вызове pkgsetAll
   * https://github.com/Tinkoff/pvm/issues/2
   */
  const repo = new Repository(cwd, config, pkgsetPackages[0]?.ref)

  const packagesForPublish = pkgsetPackages.filter(pkg => repo.pkgset.has(pkg) && (!flags.filter.length || matchAny(pkg, flags.filter)))

  const publishApplier = flags.canary ? new CanaryPublishApplier(repo, new PkgSet(packagesForPublish), flags)
    : new BasicPublishApplier(repo)

  if (flags.byDependentOrder) {
    const dependentPackagesList: Pkg[][] = []
    const tree = buildDependantPackagesListIntoTree(packagesForPublish)

    visitDependantPackagesTree(tree, (nodes) => {
      dependentPackagesList.push(Array.from(nodes).map((node) => node.value))
    })

    logger.log(chalk`{blue start publish dependent packages in ${dependentPackagesList.length} steps}`)

    for (const packages of dependentPackagesList) {
      await concurrencyPublish(packages)
    }
  } else {
    await concurrencyPublish(packagesForPublish)
  }

  if (publishedPkgsStats.skipped.length) {
    logger.log(`skipped packages:`)
    printUnpublishedSummary(publishedPkgsStats.skipped)
  }

  if (publishedPkgsStats.error.length) {
    logger.log(`errored packages:`)
    printUnpublishedSummary(publishedPkgsStats.error, chalk.red)
  }

  if (skipRealPublishing) {
    logger.log(chalk`{yellowBright [DRY RUN] publish summary}:`)
  } else {
    logger.log(chalk`{yellowBright successfully published packages}:`)
  }
  printPublishedSummary(publishedPkgsStats.success)

  if (flags.notify) {
    try {
      const prevReleaseTag = lastReleaseTag(config)
      const message = await releaseMessage({
        targetType: 'slack', // for now only slack is supported
        tag: flags.canary ? [prevReleaseTag, `canary:${flags.tag}`].filter(Boolean).join('-') : prevReleaseTag,
        commits: flags.canary ? await commits(cwd, prevReleaseTag, ref) : await getReleaseCommits(config),
        packagesStats: publishedPkgsStats,
        pvmConfig: config,
        registry: passedRegistry,
      }, {
        notifyScript: flags.notifyScript,
        strategy: flags.strategy,
        hostApi: await getHostApi(),
      })

      if (flags.messageChannel) {
        message.channel = flags.messageChannel
      }

      if (!skipRealPublishing) {
        const notificator = await Notificator.create(config.cwd)
        await notificator.sendMessage(message)
      } else {
        logger.info('Notify message:')
        logger.info(JSON.stringify(message))
      }
    } catch (e) {
      logger.warn('Something went wrong while sending notification message:')
      logger.warn(e)
    }
  }

  if (flags.outputStats) {
    logger.log(chalk`writing output stats to {yellow ${flags.outputStats}}`)
    fs.writeFileSync(flags.outputStats, JSON.stringify(sortPublishedStats(publishedPkgsStats), null, 2))
  }

  return publishedPkgsStats

  // Чтобы не загромождать флоу вспомогательные функции вынесены в низ тела основной функции

  function concurrencyPublish(packages: Pkg[]): Promise<void[]> {
    logger.info(`publish ${packages.length} packages to remote registry in ${enpl(['%1 threads', '%1 thread', '%1 threads'], concurrency)}`)
    return pMap(packages, publishAndCatch, {
      concurrency,
      stopOnError: flags.bail,
    })
  }

  async function publishAndCatch(pkg: Pkg): Promise<void> {
    const disabledFor = config.publish.disabled_for
    const enabledOnlyFor = config.publish.enabled_only_for
    if (micromatch.isMatch(pkg.path, disabledFor) || enabledOnlyFor.length && !micromatch.isMatch(pkg.path, enabledOnlyFor)) {
      logger.info(`Skip publish for ${pkg.name} due to "publish.disabled_for" or "publish.enabled_only_for" configuration`)
      return
    }

    try {
      const pkgStats = await publishPackage(pkg, publishApplier, repo, flags)
      if (pkgStats) {
        pushPkgStats(publishedPkgsStats, pkgStats)
      }
    } catch (e) {
      pushPkgStats(publishedPkgsStats, createErrorStats({
        pkg: pkg.name,
        reason: String(e),
        publishVersion: pkg.version,
      }))
      logger.error(`Failed to publish package ${pkg.name}:`)
      logger.error(e)
      if (flags.bail) {
        throw e
      }
    }
  }
}

function isSkipRealPublishing(flags: Flags): boolean {
  return !!(flags.dryRun || (PVM_TESTING_ENV && !PVM_FORCE_TEST_PUBLISH) || PVM_EXTERNAL_DRY_RUN)
}

async function publishPackage(inputPkg: Pkg, publishApplier: AbstractPublishApplier, repo: Repository, flags: Flags): Promise<PkgSuccessStats | PkgFailStats | PkgSkippedStats | null> {
  const { loggerStream, bufferedLogger } = createBufferedLogger()
  const config = repo.config

  if (!inputPkg.isAllowedForPublishing()) {
    return null
  }

  if (config.versioning.source === 'tag') {
    if (inputPkg.version) {
      bufferedLogger.log(chalk`version-from-tag: resolved "{blue ${inputPkg.version}}" version from corresponding git tag`)
    } else {
      bufferedLogger.log(chalk`version-from-tag: version for package {blue ${inputPkg.name}} not found, skip publishing`)
      return null
    }
  }

  const passedRegistry = getPassedRegistry(flags, config)
  const registry = getPkgRegistry(inputPkg, flags)

  const { publishEnv } = await setupPublishNpmRCAndEnvVariables(repo.cwd, {
    baseRegistry: passedRegistry,
    logger,
  })

  if (!inputPkg.publishRegistry) {
    bufferedLogger.log(chalk`registry is overridden via cli/settings to {blue.bold ${registry}}`)
  }

  let publishedVersions: string[] = []
  let registryDistTags: Record<string, string> = {}
  try {
    publishedVersions = await getSortedPublishedVersions(inputPkg.name, registry)
  } catch (e) {
    bufferedLogger.warn(e)
    // @TODO: more robust error handling
  }

  try {
    registryDistTags = getDistTags(inputPkg.name, registry)
  } catch (e) {
    // pass
  }

  const registryVersion: string | null = publishedVersions[publishedVersions.length - 1] ?? null

  bufferedLogger.log(`semver highest published version is ${registryVersion}`)

  let distTag

  const appliedPkg = await publishApplier.applyForPublish(inputPkg)
  if (flags.canary) {
    // в canary режиме тег не latest, поэтому его расчет не требуется
    distTag = flags.tag
  } else {
    distTag = calculateDistTag({
      bufferedLogger,
      publishedVersions,
      publishVersion: appliedPkg.version,
      pkg: inputPkg,
      registry,
      flags,
    })
  }

  const publishVersion = appliedPkg.version

  bufferedLogger.log(chalk`publishing {blue.bold ${appliedPkg.name}@${publishVersion}} from ${appliedPkg.publishPath}`)

  const skipRealPublishing = isSkipRealPublishing(flags)
  if (!skipRealPublishing && publishedVersions.indexOf(publishVersion) !== -1) {
    bufferedLogger.log(`You are trying to publish already published version ${publishVersion}, skipping publishing`)

    // if dist-tags supported then try to set current dist tag on already published pkg, so result will be like normal publish
    const distTagsCommandSupported = areDistTagsSupported(appliedPkg.name, registry)
    bufferedLogger.log(chalk`used registry does${distTagsCommandSupported ? '' : ' not'} support npm dist-tag command`)
    if (distTagsCommandSupported && distTag && registryDistTags[distTag] !== publishVersion) {
      await runShell(`npm dist-tags add ${appliedPkg.name}@${publishVersion} ${distTag} ${registry ? `--registry ${registry}` : ''}`, {
        stdio: ['pipe', loggerStream, loggerStream],
      })
    }

    return createSkippedStats({
      pkg: appliedPkg.name,
      publishVersion,
      reason: 'same version',
    })
  }

  if (!flags.dryRun && !appliedPkg.isMetaEqualsTo(inputPkg)) {
    appliedPkg.save()
  }

  const publishCommand = [
    `npm publish ${inputPkg.publishPath}`,
    `--tag ${distTag || 'latest'}`,
    ...(skipRealPublishing ? ['--dry-run'] : []),
    ...(registry ? [`--registry ${registry}`] : []),
    ...(config.publish.cli_args ? [config.publish.cli_args] : []),
  ].join(' ')
  bufferedLogger.log(publishCommand)

  await runShell(publishCommand, {
    env: publishEnv,
    stdio: ['pipe', loggerStream, loggerStream],
  })

  printBufferedLogger(loggerStream)

  return createSuccessStats({
    pkg: appliedPkg.name,
    registryVersion,
    publishedVersion: publishVersion,
  })
}

function calculateDistTag({
  bufferedLogger,
  publishedVersions,
  publishVersion,
  pkg,
  registry,
  flags,
}: {
  bufferedLogger: typeof logger,
  publishedVersions: string[],
  publishVersion: string,
  pkg: Pkg,
  registry?: string,
  flags: Flags,
}): string {
  let distTag = flags.tag

  if (publishedVersions.length !== 0) {
    let tagLatestPublishVersion: string | null = null
    try {
      tagLatestPublishVersion = shell(`npm view ${pkg.name} version ${registry ? `--registry ${registry}` : ''}`, { stdio: 'pipe' })
    } catch (e) {
      bufferedLogger.error(e)
    }

    bufferedLogger.log(`current version published under "latest" tag is ${tagLatestPublishVersion}`)

    if (tagLatestPublishVersion && semver.gt(tagLatestPublishVersion, publishVersion)) {
      const sv = semver.parse(publishVersion)
      if (!distTag) {
        // do not overwrite latest tag in case of publishing not latest version
        distTag = sv && sv.prerelease && sv.prerelease[0]?.toString() || 'pvm-last-published'
      }
      bufferedLogger.log(
        chalk`{yellowBright Already published version is greater than currently publishing one}, dist tag {blue.bold ${distTag}} will be used for publishing this version`
      )
    }
  }

  return distTag
}

// fixme: через мутацию конфига это делать не очень круто т.к. лишаемся фишки конфига, что его можно
// получить в любом месте кода без доп. протаскивания через переменные
function applyFlagsToConfig(config: Config, flags: Flags): Config {
  // Меняем вид версионирования в соответствии с флагом
  if (flags.forceVersioning) {
    logger.warn(`Force versioning to ${flags.forceVersioning}`)
    config = JSON.parse(JSON.stringify(config))
    config.versioning.source = flags.forceVersioning
  }

  return config
}

function applyFlagsDefaultsForUnification(flags: Flags): Flags {
  // унифицируем дефолтные значения для вызовов через node api и cli
  return defaults(flags, mapValues(flagsBuilder, builder => builder.default))
}

async function initPlugins(cwd): Promise<void> {
  // для загрузки плагинов
  await getHostApi(cwd)
}

let distTagsCommandSupported
function areDistTagsSupported(pkgName: string, registry?: string): boolean {
  if (distTagsCommandSupported === void 0) {
    try {
      shell(`npm dist-tags ls ${pkgName} version ${registry ? `--registry ${registry}` : ''}`, { stdio: 'pipe' })
      distTagsCommandSupported = true
    } catch (e) {
      distTagsCommandSupported = false
    }
  }

  return distTagsCommandSupported
}

function getDistTags(pkgName: string, registry?: string): Record<string, string> {
  const distTagsStr = `(${shell(`npm view ${pkgName} dist-tags ${registry ? `--registry ${registry}` : ''}`, { stdio: 'pipe' })})`
  const script = new vm.Script(distTagsStr)
  return script.runInContext(vm.createContext({}))
}

async function getSortedPublishedVersions(pkgName: string, registry?: string): Promise<string[]> {
  let distTags
  try {
    const versionsStr = (await execShell(`npm view ${pkgName} versions --json ${registry ? `--registry ${registry}` : ''}`)).stdout
    // could be undefined in nexus if only published version not with latest tag
    distTags = versionsStr ? JSON.parse(versionsStr) : []
    if (typeof distTags === 'string') {
      distTags = [distTags]
    }
  } catch (e) {
    // if package completely unpublished
    if (e.toString().indexOf('E404') !== -1) {
      return []
    }
    throw e
  }

  return semver.sort(distTags)
}
