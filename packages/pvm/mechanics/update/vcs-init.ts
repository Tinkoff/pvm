import type { VcsPlatform } from '../vcs'
import { initVcsPlatform } from '../vcs'
import type { Container } from '../../lib/di'
import { CONFIG_TOKEN } from '../../tokens'

export interface VcsInitForUpdateOpts {
  dryRun?: boolean,
  local?: boolean,
  vcsMode?: 'platform' | 'vcs',
  cwd?: string,
}

const vcsInstances = new Map<string, VcsPlatform>()

function normalizedObjectHash(rec: Record<string, any>): string {
  return JSON.stringify(Array.from(Object.entries(rec)).sort((a, b) => {
    if (a[0] === b[0]) {
      return 0
    }
    if (a[0] < b[0]) {
      return -1
    }
    return 1
  }))
}

export async function vcsInitForUpdate(di: Container, opts: VcsInitForUpdateOpts = {}): Promise<VcsPlatform> {
  const cacheKey = normalizedObjectHash(opts)

  if (vcsInstances.has(cacheKey)) {
    return vcsInstances.get(cacheKey)!
  }
  const { dryRun = false, local = false, vcsMode: vcsModeFromOpts } = opts
  const config = di.get(CONFIG_TOKEN)
  const { commit_via_platform } = config.update

  const vcsMode = vcsModeFromOpts ?? commit_via_platform ? 'platform' : 'vcs'

  // initialize vcsPlatform at early stage
  const vcs = await initVcsPlatform(di, {
    dryRun,
    localMode: local,
    vcsMode,
  })
  vcsInstances.set(cacheKey, vcs)

  return vcs
}
