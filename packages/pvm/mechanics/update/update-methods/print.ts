import pprint from "../../pkgset/pprint"
import type { UpdateState } from '../update-state'
import type { UpdateMethod, CliUpdateOpts, Vcs } from '../types/index'

async function * iterableToAsyncIterable<T>(it: Iterable<T>): AsyncIterableIterator<T> {
  return yield * it
}

async function print(updateState: UpdateState, _vcs: Vcs, cliOpts: CliUpdateOpts): Promise<AsyncIterable<string>> {
  const { format = '%n' } = cliOpts

  return pprint(iterableToAsyncIterable(updateState.getReleasePackages().values()), format)
}

export const run: UpdateMethod<AsyncIterable<string>>['run'] = print
