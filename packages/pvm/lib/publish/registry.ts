import type { Flags } from './flags'
import type { Config } from '@pvm/core/lib/config'
import type { Pkg } from '@pvm/core/lib/pkg'

export function getPassedRegistry(flags: Flags, config: Config): string | undefined {
  return flags.registry || config.publish.registry
}

export function getPkgRegistry(pkg: Pkg, flags: Flags): string | undefined {
  return pkg.publishRegistry || getPassedRegistry(flags, pkg.pvmConfig)
}
