import pkgsetChanged from '@pvm/pkgset/lib/strategies/changed'
import pkgsetAffected from '@pvm/pkgset/lib/strategies/affected'
import pkgsetSinceRelease from '@pvm/pkgset/lib/strategies/changed-since-release'
import pkgsetReleased from '@pvm/pkgset/lib/strategies/released'
import drainItems from '@pvm/core/lib/iter/drain-items'
import { getUpdateState } from '@pvm/update/lib'
import { matchAny } from '@pvm/core/lib/pkg-match'
import fromGlobPatterns from '@pvm/pkgset/lib/from-glob-patterns'
import type { Pkg } from '@pvm/core/lib/pkg'
import { concatPackages } from '@pvm/core/lib/pkg'
import { Repository } from '@pvm/repository/lib'

// connected with type yargs.commands['pvm-publish].options.list.choices in ../cli/commands/pvm-packages.ts
type PackagesType = 'about-to-update' | 'update' | 'changed' | 'changed-since-release' | 'affected' | 'released' | 'updated' | 'all'

interface GetPackagesOptions {
  filter?: string[],
  ignoreDangerouslyOpts?: boolean,
  cwd?: string,
}

export async function getPackages(type: PackagesType = 'all', opts: GetPackagesOptions = {}): Promise<Pkg[]> {
  let packages
  const { ignoreDangerouslyOpts = false, cwd = process.cwd() } = opts
  const repo = await Repository.init(cwd)

  let always_changed_workspaces: string[] = []
  let extraPackages: Iterable<Pkg> = []
  if (!ignoreDangerouslyOpts) {
    const config = repo.config
    always_changed_workspaces = config.dangerously_opts?.always_changed_workspaces || []

    if (always_changed_workspaces.length) {
      extraPackages = fromGlobPatterns(config, always_changed_workspaces, void 0)
    }
  }

  switch (type) {
    case 'about-to-update':
    case 'update':
      // getUpdateState сам подключает always_changed_workspaces
      packages = Array.from((await getUpdateState({ readonly: true, cwd })).getReleasePackages().keys())
      break
    case 'changed':
      packages = await drainItems(pkgsetChanged({ includeUncommited: true, cwd }))
      packages = concatPackages(packages, extraPackages)
      break
    case 'affected':
      packages = await drainItems(pkgsetAffected({ includeUncommited: true, cwd }))
      break
    case 'changed-since-release':
      packages = await drainItems(pkgsetSinceRelease({ cwd }))
      packages = concatPackages(packages, extraPackages)
      break
    case 'released':
    case 'updated':
      packages = await drainItems(pkgsetReleased({ cwd }))
      break
    default:
      // 'all'
      packages = [...repo.packagesList]
      break
  }

  const { filter } = opts
  if (filter && filter.length) {
    packages = packages.filter(pkg => matchAny(pkg, filter))
  }

  return packages
}
