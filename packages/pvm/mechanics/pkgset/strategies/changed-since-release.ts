import type { PkgsetChangedOpts } from './changed'
import changed from './changed'
import { lastReleaseTag } from '../../../lib/git/last-release-tag'
import { wdShell } from '../../../lib/shell'
import { log } from '../../../lib/logger'
import { getConfig } from '../../../lib/config'
import type { Pkg } from '../../../lib/pkg'

type PkgsetChangedAtReleaseOpts = PkgsetChangedOpts & Partial<{
  ref: string,
}>

async function * pkgset(opts: PkgsetChangedAtReleaseOpts = {}): AsyncIterableIterator<Pkg> {
  const { ref = 'HEAD', cwd = process.cwd() } = opts
  const config = await getConfig(cwd)

  const revSha = wdShell(cwd, `git rev-parse ${ref}`)

  // if rev is release, we need find previous release
  let fromRev = lastReleaseTag(config, `${revSha}^`)

  if (!fromRev) {
    log('previous release not found, so only packages changed in current commit will be taken in account')
    fromRev = `${revSha}^`
  }

  yield * changed({
    ...opts,
    from: fromRev,
    to: ref,
  })
}

export default pkgset
