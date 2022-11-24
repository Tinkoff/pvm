import drainItems from './drain-items'
import { collectItemsToRecord } from './collect-items'
import takeFirst from './take-first'
import cachedIterator from './cached-iteration'

export interface DrainResult<T> {
  value: T[],
  error: null | Error,
}

async function drainWhileResolves<T>(asyncIterable: AsyncIterable<T>): Promise<DrainResult<T>> {
  const asyncIterator = asyncIterable[Symbol.asyncIterator]()

  const result: DrainResult<T> = {
    value: [],
    error: null,
  }
  while (true) {
    try {
      const { done, value } = await asyncIterator.next()
      if (done) {
        break
      }
      result.value.push(value)
    } catch (e) {
      // ok, we done here
      result.error = e
      break
    }
  }

  return result
}

export type SafeIterationResult<T> = [T, null] | [undefined, Error]

async function * safeIterate<T>(asyncIterable: AsyncIterable<T>): AsyncIterableIterator<SafeIterationResult<T>> {
  const asyncIterator = asyncIterable[Symbol.asyncIterator]()

  while (true) {
    try {
      const { done, value } = await asyncIterator.next()
      if (done) {
        break
      }
      yield [value, null]
    } catch (e) {
      yield [void 0, e]
      break
    }
  }
}

export function takeFirstSync<T>(seq: Iterable<T>): T | undefined {
  for (const item of seq) {
    return item
  }
}

export function someSync<T>(seq: Iterable<T>, pred: (item: T) => boolean): boolean {
  for (const item of seq) {
    if (pred(item)) {
      return true
    }
  }
  return false
}

export {
  takeFirst,
  drainItems,
  safeIterate,
  drainWhileResolves,
  collectItemsToRecord,
  cachedIterator,
}
