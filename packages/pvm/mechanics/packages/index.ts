import pkgsetChanged from '../pkgset/strategies/changed'
import pkgsetAffected from '../pkgset/strategies/affected'
import pkgsetSinceRelease from '../pkgset/strategies/changed-since-release'
import pkgsetReleased from '../pkgset/strategies/released'
import drainItems from '../../lib/iter/drain-items'
import { getUpdateState } from '../update'
import { matchAny } from '../../lib/pkg-match'
import fromGlobPatterns from '../pkgset/from-glob-patterns'
import type { Pkg } from '../../lib/pkg'
import { concatPackages } from '../../lib/pkg'
import { Repository } from '../repository'
import type { Container } from '../../lib/di'

// connected with type yargs.commands['pvm-publish].options.list.choices in ../cli/commands/pvm-packages.ts
type PackagesType = 'about-to-update' | 'update' | 'changed' | 'changed-since-release' | 'affected' | 'released' | 'updated' | 'all'

interface GetPackagesOptions {
  filter?: string[],
  ignoreDangerouslyOpts?: boolean,
  cwd?: string,
}

export async function getPackages(di: Container, type: PackagesType = 'all', opts: GetPackagesOptions = {}): Promise<Pkg[]> {
  let packages
  const { ignoreDangerouslyOpts = false, cwd = process.cwd() } = opts
  const repo = await Repository.init(di)

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
      packages = Array.from((await getUpdateState(di, { readonly: true, cwd })).getReleasePackages().keys())
      break
    case 'changed':
      packages = await drainItems(pkgsetChanged(di, { includeUncommited: true, cwd }))
      packages = concatPackages(packages, extraPackages)
      break
    case 'affected':
      packages = await drainItems(pkgsetAffected(di, { includeUncommited: true, cwd }))
      break
    case 'changed-since-release':
      packages = await drainItems(pkgsetSinceRelease(di, { cwd }))
      packages = concatPackages(packages, extraPackages)
      break
    case 'released':
    case 'updated':
      packages = await drainItems(pkgsetReleased(di, { cwd }))
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