import strategies from './strategies/index'
import type { Pkg } from '../../lib/pkg'
import { parseSubArgs } from '../../lib/text/sub-args'
import type { Container } from '../../lib/di'

function pkgset(di: Container, strategy: string, opts: Record<string, any> = {}): AsyncIterable<Pkg> {
  const strategyFn = strategies[strategy]
  if (typeof strategyFn !== 'function') {
    throw new Error(`no such strategy ${strategy}`)
  }

  return strategyFn(di, opts)
}

async function * pkgsetFromFlags(di: Container, flags: {
  strategy: string,
  strategyOption?: string[],
}): AsyncIterableIterator<Pkg> {
  yield * pkgset(di, flags.strategy, parseSubArgs(flags.strategyOption))
}

export {
  pkgset,
  pkgsetFromFlags,
}
