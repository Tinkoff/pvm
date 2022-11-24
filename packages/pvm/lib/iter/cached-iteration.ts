
interface IterationStatus<T> {
  items: T[],
  started: boolean,
  finished: boolean,
  willFinished: Promise<unknown>,
  error?: Error,
}

type AsyncIterableGetter<T> = () => AsyncIterable<T>

const asyncIterablesCache = new Map<AsyncIterableGetter<any>, IterationStatus<any>>()

function iterateCached<T>(getAsyncIterator: AsyncIterableGetter<T>, ctx: any): AsyncIterableIterator<T> {
  let resolveFinished
  let rejectFinished

  const makeInitialStatus = (): IterationStatus<T> => {
    const willFinished: Promise<unknown> = new Promise((resolve, reject) => {
      resolveFinished = resolve
      rejectFinished = reject
    }).catch(() => {
      // pass
    })

    return {
      items: [],
      started: false,
      finished: false,
      willFinished,
    }
  }

  const status = asyncIterablesCache.get(getAsyncIterator) || makeInitialStatus()

  if (!asyncIterablesCache.has(getAsyncIterator)) {
    asyncIterablesCache.set(getAsyncIterator, status)
  }

  async function * cachedIterator() {
    if (status.finished) {
      for (const item of status.items) {
        yield item
      }
      if (status.error) {
        throw status.error
      }
    } else if (!status.started) {
      status.started = true
      try {
        for await (const value of getAsyncIterator.call(ctx)) {
          status.items.push(value)
          yield value
        }
      } catch (e) {
        status.error = e
        throw e
      } finally {
        status.finished = true
        if (status.error) {
          rejectFinished(new Error(`StopIteration via error ${status.error}`))
        } else {
          resolveFinished()
        }
      }
    } else {
      await status.willFinished
      yield * cachedIterator()
    }
  }

  return cachedIterator()
}

export default iterateCached
