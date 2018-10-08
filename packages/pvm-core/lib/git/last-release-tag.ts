import { isReleaseTag, releaseTagMask } from '../tag-meta'
import { shellOr, shell } from '../shell'
import revParse from './rev-parse'
import { taggedCacheManager, CacheTag } from '../memoize'
import type { Config } from '../config'
import { env } from '../env'
import { gitFetch } from './commands'

export const tagsCache = taggedCacheManager.make<string>([CacheTag.gitFetchTags])

export function fetchTags(cwd: string): void {
  gitFetch(cwd, { tags: true })
}

function lastMatchedTagImpl(cwd: string, mask: string, target: string | void = void 0): string {
  // как с опцией --first-parent так и без нее, одназночно последний релизный тег они не дают
  // поэтому берем обе и из них берем последнюю, см. PVM-149
  // Вообще если мержить только в мастер, а мастер никуда не мержить то можно
  // для главного бранча – брать через --first-parent, т.к. нам мержи из веток не интересны (см. PVM-139)
  // а в ситуации с бранчами брать напрямую (см. PVM-144)

  const firstParentTag = shellOr(
    '',
    `git describe --tags --abbrev=0 --first-parent --match ${mask} ${target || ''}`,
    { cwd }
  )
  const nonFPTag = shellOr('', `git describe --tags --abbrev=0 --match ${mask} ${target || ''}`, { cwd })
  if ((!firstParentTag || !nonFPTag) || firstParentTag === nonFPTag) {
    return firstParentTag || nonFPTag
  }

  try {
    // как правило если оба есть и отличаются, firstParentTag будет более старым
    shell(`git merge-base --is-ancestor "${firstParentTag}" "${nonFPTag}"`, { cwd })
    return nonFPTag
  } catch (e) {
    if (e.status !== 1) {
      throw e
    }
    return firstParentTag
  }
}

export function lastMatchedTag(cwd: string, mask: string, target: string | undefined = void 0): string {
  const cacheArgs = [mask, target]

  let result = tagsCache.get(cwd, cacheArgs)
  if (result === void 0) {
    result = lastMatchedTagImpl(cwd, mask, target)
    tagsCache.set(cwd, cacheArgs, result)
  }
  return result
}

export function lastReleaseTagIgnoreEnv(config: Config, target: string | undefined = void 0): string {
  return lastMatchedTag(config.cwd, releaseTagMask(config), target)
}

export function lastReleaseTag(config: Config, targetRef: string | undefined = void 0): string {
  const ciTag = env.CI_COMMIT_TAG
  const allowGetFromEnv =
    ciTag && (!targetRef || revParse(targetRef, config.cwd) === revParse(ciTag, config.cwd)) && isReleaseTag(config, ciTag)

  return allowGetFromEnv ? ciTag! : lastReleaseTagIgnoreEnv(config, targetRef)
}

// возвращает предыдуший от target релиз если target сам указывает на релиз
// иначе возвращает возвращает последний релиз от target
export function prevReleaseTag(config: Config, target = 'HEAD'): string {
  const latestReleaseTag = lastReleaseTag(config, target)

  if (latestReleaseTag && revParse(latestReleaseTag, config.cwd) === revParse(target, config.cwd)) {
    return lastReleaseTag(config, `${target}^`)
  }

  return latestReleaseTag
}
