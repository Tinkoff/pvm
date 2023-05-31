import { isShallowRepository } from '../../lib/git/commands'
import { lastReleaseTagIgnoreEnv } from '../../lib/git/last-release-tag'

import type { Config } from '../../types'

export enum ReleasePosition {
  following, // это не первый релиз, перед ним еще есть
  initial, // это начальный релиз
  shallow, // это первый релиз в shallowed репозитории
}

export interface FollowingReleaseInfo {
  releasePosition: ReleasePosition.following,
  tagName: string,
  prevTagName: string,
}

export interface SoleReleaseInfo {
  releasePosition: ReleasePosition.initial | ReleasePosition.shallow,
  tagName: string,
}

export type ReleaseLookBack = FollowingReleaseInfo | SoleReleaseInfo

export function lookBackForReleaseTag(config: Config, releaseTag: string, isShallow = isShallowRepository(config.cwd)): ReleaseLookBack {
  const prevTagName = lastReleaseTagIgnoreEnv(config, `${releaseTag}^`)
  let releasePosition = ReleasePosition.following
  if (!prevTagName) {
    if (!isShallow) {
      releasePosition = ReleasePosition.initial
    } else {
      releasePosition = ReleasePosition.shallow
    }
    return {
      releasePosition,
      tagName: releaseTag,
    }
  } else {
    return {
      releasePosition,
      prevTagName,
      tagName: releaseTag,
    }
  }
}
