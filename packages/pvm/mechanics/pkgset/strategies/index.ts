import type { PkgsetChangedOpts } from './changed'
import changed from './changed'
import stdin from './stdin'
import stale from './stale'
import all from './all'
import changedAt from './changed-at'
import changedSinceRelease from './changed-since-release'
import released from './released'
import affected from './affected'
import type { Container } from '../../../lib/di'
import type { Pkg } from '../../../lib/pkg'

const strategies: Record<string, (di: Container, opts?: PkgsetChangedOpts) => AsyncIterableIterator<Pkg>> = {
  changed,
  stdin,
  stale,
  all,
  released,
  updated: released,
  'changed-at': changedAt,
  'changed-since-release': changedSinceRelease,
  affected,
}

export function getStrategiesDescriptionList(): string[] {
  return [...new Set((Object.values(strategies) as any[]).filter(s => s.description).map(s => s.description))]
}

export default strategies
