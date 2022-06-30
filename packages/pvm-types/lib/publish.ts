import type { Commit } from './git'
import type { Config } from './config-schema'

export interface PkgSuccessStats {
  pkg: string,
  registryVersion: string | null,
  publishedVersion: string,
  type: 'success',
}

export interface PkgFailStats {
  pkg: string,
  publishVersion: string,
  reason: string,
  type: 'failed',
}

export interface PkgSkippedStats {
  pkg: string,
  publishVersion: string,
  reason: string,
  type: 'skipped',
}

export interface PublishedStats {
  success: PkgSuccessStats[],
  skipped: PkgSkippedStats[],
  error: PkgFailStats[],
}

export interface ReleasedProps {
  tag: string,
  targetType: 'slack',
  commits: Commit[] | void,
  packagesStats: PublishedStats,
  pvmConfig: Config,
  registry?: string | undefined,
}

export type SemverReleaseType = 'prerelease' | 'prepatch' | 'patch' | 'preminor' | 'minor' | 'premajor' | 'major'
export type PvmReleaseType = 'none' | SemverReleaseType

export interface UpdateHints {
  'release-type'?: PvmReleaseType,
  'release-types'?: Partial<Record<PvmReleaseType, string | string[]>>,
  'update-dependants-for'?: Array<{
    match: string,
    'release-type': PvmReleaseType | 'as-dep',
  }>,
}
