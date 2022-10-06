import gitCommits from './commits'
import type { Pkg } from '../pkg'
import type { Commit } from '@pvm/types'

async function pkgCommits(pkg: Pkg, from: string, to: string): Promise<Commit[]> {
  return gitCommits(pkg.pvmConfig.cwd, from, to, {
    _: ['--', pkg.path],
  })
}

export {
  pkgCommits,
}
