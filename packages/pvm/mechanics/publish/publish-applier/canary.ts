import type { PkgSet } from '../../../lib/pkg-set'
import semver from 'semver'
import { logger } from '../../../lib/logger'
import { PkgMap } from '../../../lib/pkg-map'
import { httpreq } from '../../../lib/httpreq'

import { AbstractPublishApplier } from './abstract'
import { getPkgRegistry } from '../registry'

import type { Pkg } from '../../../lib/pkg'
import type { Repository } from '../../repository'
import type { Flags } from '../flags'

export class CanaryPublishApplier extends AbstractPublishApplier {
  // Для однократного расчета canary версии. Инвалидация будет происходить за счет изменения ссылки на Pkg
  // в результате перезагрузки пакета в loadPkg.
  private canaryVersions: PkgMap<string> = new PkgMap()
  private canaryVersionCalcTasks: PkgMap<PromiseLike<string>> = new PkgMap()
  private publishedPackages: PkgSet
  private flags: Flags

  // eslint-disable-next-line no-useless-constructor
  constructor(repo: Repository, publishedPackages: PkgSet, flags: Flags) {
    super(repo)
    this.publishedPackages = publishedPackages
    this.flags = flags
  }

  async prepare(): Promise<void> {
    if (this.flags['canary-unified']) {
      await this.prepareUnifiedCanaryVersion(undefined)
    }
  }

  /**
   * Algorithm in here - taking max canary version index across all packages with given preid. Then incrementing it
   * and use as common canary index that fits to all packages.
   */
  async prepareUnifiedCanaryVersion(unifiedBaseCanaryIndex: number | undefined) {
    if (!unifiedBaseCanaryIndex) {
      logger.info('Beginning loop for searching common canary index for unified release')
    } else {
      logger.info(`Next base canary index ${unifiedBaseCanaryIndex}. Testing its fit`)
    }

    const versions = (await Promise.all(this.publishedPackages.map(pkg => this.asyncSafeCalcCanaryVersion(pkg, unifiedBaseCanaryIndex)))).sort()
    logger.info(`Canary iteration versions:\n${versions.join('\n')}`)

    if (versions.length > 1 && versions[0] !== versions[versions.length - 1]) {
      if (unifiedBaseCanaryIndex) {
        // recursion break. According to algorithm this should never be reached.
        throw new Error('Failed to calculate common canary version. ')
      }

      const maxVersion = versions[versions.length - 1]
      unifiedBaseCanaryIndex = Number(semver.parse(maxVersion)?.prerelease[1])
      logger.info(`Next canary base version: ${unifiedBaseCanaryIndex}`)

      // dropping all calculation caches and recursively trying to find common canary index
      this.canaryVersions = new PkgMap()
      this.canaryVersionCalcTasks = new PkgMap()
      await this.prepareUnifiedCanaryVersion(unifiedBaseCanaryIndex)
    }
  }

  async getPkgPublishVersion(pkg: Pkg): Promise<string> {
    return await this.asyncSafeCalcCanaryVersion(pkg, undefined)
  }

  async asyncSafeCalcCanaryVersion(pkg: Pkg, unifiedBaseCanaryIndex: number | undefined): Promise<string> {
    if (!this.publishedPackages.has(pkg.name)) {
      return pkg.version
    }

    if (!this.canaryVersionCalcTasks.has(pkg.name)) {
      this.canaryVersionCalcTasks.set(pkg, this.calcCanaryVersion(pkg, getPkgRegistry(pkg, this.flags) || this.repo.registry, this.flags.tag, unifiedBaseCanaryIndex))
    }

    return this.canaryVersionCalcTasks.get(pkg.name)!
  }

  async calcCanaryVersion(pkg: Pkg, registry: string, preid: string, unifiedBaseCanaryIndex: number | undefined): Promise<string> {
    const canaryUnified = this.flags['canary-unified']
    const canaryBaseVersion = this.flags['canary-base-version']

    if (this.canaryVersions.has(pkg.name)) {
      return this.canaryVersions.get(pkg.name)!
    }

    const currentVersion = canaryUnified ? canaryBaseVersion : pkg.version
    const resultVersion = semver.parse(currentVersion)
    if (!resultVersion) {
      throw new Error(`Non semver-compatible version ${currentVersion} in pkg ${pkg.name}`)
    }

    logger.warn(`Retrieving all published versions for pkg ${pkg.name}`)

    let packumentStr
    try {
      /**
       * npm view не возвращает список версий если для пакета не было публикации с latest тегом (https://github.com/npm/cli/issues/4029)
       * Поэтому ходим в registry напрямую через rest api
       */
      packumentStr = (await httpreq(`${registry.replace(/\/$/, '')}/${pkg.name}`)).body
    } catch (e) {
      if (e.statusCode !== 404) {
        throw e
      }
    }

    let allPkgVersions: string[] = []
    if (packumentStr) {
      allPkgVersions = Object.keys(JSON.parse(packumentStr).versions)
    }

    let nextCanaryIndex
    const canaryVersionPrefix = `${resultVersion.major}.${resultVersion.minor}.${resultVersion.patch}-${preid}`
    if (canaryUnified && unifiedBaseCanaryIndex) {
      const canaryVersionWithPreid = `${canaryVersionPrefix}.${unifiedBaseCanaryIndex}`
      if (!allPkgVersions.find(v => v === canaryVersionWithPreid)) {
        nextCanaryIndex = unifiedBaseCanaryIndex
      } else {
        let freeIndex = unifiedBaseCanaryIndex
        while (allPkgVersions.find(v => v === `${canaryVersionPrefix}.${freeIndex}`)) {
          freeIndex++
        }
        nextCanaryIndex = freeIndex
      }
    } else {
      const samePrefixVersions = allPkgVersions.filter(v => v.startsWith(canaryVersionPrefix))
      const maxSatisfyingVersion = semver.sort(samePrefixVersions).reverse()[0] as string
      if (maxSatisfyingVersion) {
        logger.debug(`Found max satisfying version ${maxSatisfyingVersion} for pkg ${pkg.name} and canary prefix ${canaryVersionPrefix}`)
        nextCanaryIndex = CanaryPublishApplier.getNextCanaryIndex(maxSatisfyingVersion, preid)
      } else {
        logger.debug(`Max satisfying version for pkg ${pkg.name} and canary prefix ${canaryVersionPrefix} is not found`)
        nextCanaryIndex = 0
      }
    }

    resultVersion.prerelease = [preid, nextCanaryIndex]
    const resultVersionString = resultVersion.format()

    logger.info(`Result canary version for ${pkg.name} is ${resultVersionString}`)

    this.canaryVersions.set(pkg, resultVersionString)

    return resultVersionString
  }

  private static getNextCanaryIndex(versionString: string, preid: string): number {
    let canaryIndex = 0

    const parsedVersion = semver.parse(versionString)
    if (parsedVersion?.prerelease) {
      const [suffix, index] = parsedVersion.prerelease
      if (suffix === preid) {
        const numIndex = Number(index)
        canaryIndex = !isNaN(numIndex) ? numIndex + 1 : canaryIndex
      }
    }

    return canaryIndex
  }
}
