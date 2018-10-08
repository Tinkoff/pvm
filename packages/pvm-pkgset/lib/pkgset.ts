import strategies from './strategies'
import type { Pkg } from '@pvm/core/lib/pkg'
import { parseSubArgs } from '@pvm/core/lib/text/sub-args'

function pkgset(strategy: string, opts: Record<string, any> = {}): AsyncIterable<Pkg> {
  const strategyFn = strategies[strategy]
  if (typeof strategyFn !== 'function') {
    throw new Error(`no such strategy ${strategy}`)
  }

  return strategyFn(opts)
}

async function * pkgsetFromFlags(flags: {
  strategy: string,
  strategyOption: string[],
}): AsyncIterableIterator<Pkg> {
  yield * pkgset(flags.strategy, parseSubArgs(flags.strategyOption))
}

export {
  pkgset,
  pkgsetFromFlags,
}
