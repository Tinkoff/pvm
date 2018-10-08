import type { Commit } from './git-log'
import type { Config } from '../lib/config'

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
