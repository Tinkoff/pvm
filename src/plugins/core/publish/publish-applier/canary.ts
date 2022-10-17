import type { PkgSet } from '@pvm/core/lib/pkg-set'
import semver from 'semver'
import { logger } from '@pvm/core/lib/logger'
import { PkgMap } from '@pvm/core/lib/pkg-map'
import httpreq from '@pvm/core/lib/httpreq'

import { AbstractPublishApplier } from './abstract'
import { getPkgRegistry } from '../registry'

import type { Pkg } from '@pvm/core/lib/pkg'
import type { Repository } from '@pvm/repository'
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

  async getPkgPublishVersion(pkg: Pkg): Promise<string> {
    return this.asyncSafeCalcCanaryVersion(pkg)
  }

  async asyncSafeCalcCanaryVersion(pkg: Pkg): Promise<string> {
    if (!this.publishedPackages.has(pkg.name)) {
      return pkg.version
    }

    if (!this.canaryVersionCalcTasks.has(pkg.name)) {
      this.canaryVersionCalcTasks.set(pkg, this.calcCanaryVersion(pkg, getPkgRegistry(pkg, this.flags) || this.repo.registry, this.flags.tag))
    }

    return this.canaryVersionCalcTasks.get(pkg.name)!
  }

  async calcCanaryVersion(pkg: Pkg, registry: string, preid: string): Promise<string> {
    if (this.canaryVersions.has(pkg.name)) {
      return this.canaryVersions.get(pkg.name)!
    }

    const currentVersion = pkg.version
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

    const canaryVersionPrefix = `${resultVersion.major}.${resultVersion.minor}.${resultVersion.patch}-${preid}`
    const samePrefixVersions = allPkgVersions.filter(v => v.startsWith(canaryVersionPrefix))
    const maxSatisfyingVersion = semver.sort(samePrefixVersions).reverse()[0] as string
    let nextCanaryIndex
    if (maxSatisfyingVersion) {
      logger.debug(`Found max satisfying version ${maxSatisfyingVersion} for pkg ${pkg.name} and canary prefix ${canaryVersionPrefix}`)
      nextCanaryIndex = CanaryPublishApplier.getNextCanaryIndex(maxSatisfyingVersion, preid)
    } else {
      logger.debug(`Max satisfying version for pkg ${pkg.name} and canary prefix ${canaryVersionPrefix} is not found`)
      nextCanaryIndex = 0
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
