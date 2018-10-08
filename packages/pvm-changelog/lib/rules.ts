import path from 'path'
import { fsEscape } from '@pvm/core/lib/tag-meta'

import type { Pkg } from '@pvm/core/lib/pkg'
import type { Config } from '@pvm/core/lib/config'

export function pkgChangelogPath(config: Config, pkg: Pkg): string {
  const conf = config.changelog

  if (!conf.for_packages.output_dir) {
    throw new Error(`Config changelog.for_packages.output_dir must not be empty`)
  }

  const changelogAbsPath = path.join(config.cwd, conf.for_packages.output_dir)
  return path.join(changelogAbsPath, fsEscape(pkg.shortName) + '.md')
}
