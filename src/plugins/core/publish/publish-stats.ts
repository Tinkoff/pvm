import type { PkgFailStats, PkgSkippedStats, PkgSuccessStats, PublishedStats } from '@pvm/types'
import { cmpStr } from '@pvm/core/lib/utils/string'
import chalk from 'chalk'
import CliTable from 'cli-table'

export function createSuccessStats(stats: Omit<PkgSuccessStats, 'type'>): PkgSuccessStats {
  return {
    ...stats,
    type: 'success',
  }
}

export function createErrorStats(stats: Omit<PkgFailStats, 'type'>): PkgFailStats {
  return {
    ...stats,
    type: 'failed',
  }
}

export function createSkippedStats(stats: Omit<PkgSkippedStats, 'type'>): PkgSkippedStats {
  return {
    ...stats,
    type: 'skipped',
  }
}

export function pushPkgStats(publishedStats: PublishedStats, pkgStats: PkgSkippedStats | PkgFailStats | PkgSuccessStats): void {
  switch (pkgStats.type) {
    case 'success':
      publishedStats.success.push(pkgStats)
      break
    case 'failed':
      publishedStats.error.push(pkgStats)
      break
    case 'skipped':
      publishedStats.skipped.push(pkgStats)
      break
  }
}

export function sortPublishedStats(publishedStats: PublishedStats): PublishedStats {
  const newStats = {
    success: [...publishedStats.success],
    skipped: [...publishedStats.skipped],
    error: [...publishedStats.error],
  }

  newStats.success = newStats.success.sort((a, b) => cmpStr(a.pkg, b.pkg))
  newStats.skipped = newStats.skipped.sort((a, b) => cmpStr(a.pkg, b.pkg))
  newStats.error = newStats.error.sort((a, b) => cmpStr(a.pkg, b.pkg))

  return newStats
}

export function printUnpublishedSummary(packages: (PkgFailStats | PkgSkippedStats)[], style = chalk.gray): void {
  const header = ['package', 'unpublished reason']

  const rows = packages.map(({ pkg, reason, publishVersion }) => {
    return [style(`${pkg}@${publishVersion}`), reason || '—']
  })

  const t = new CliTable({
    head: header,
  })
  t.push(...rows)

  console.log(t.toString())
}

export function printPublishedSummary(publishedPackages: PkgSuccessStats[]): void {
  const header = ['package', 'version', 'latest registry version']

  const rows = publishedPackages.map(({ pkg, publishedVersion, registryVersion }) => {
    return [chalk`{blue.bold ${pkg}}`, chalk`{greenBright ${publishedVersion}}`, registryVersion || '—']
  })

  const t = new CliTable({
    head: header,
  })
  t.push(...rows)

  console.log(t.toString())
}
