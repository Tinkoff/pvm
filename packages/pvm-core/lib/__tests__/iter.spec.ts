import { drainWhileResolves, cachedIterator } from '../iter'

async function * yield3andReject() {
  await Promise.resolve()
  yield 1
  await Promise.resolve()
  yield 2
  await Promise.resolve()
  throw new Error('oops')
  yield 3
  await Promise.resolve()
}

describe('core/iter', () => {
  it('drainWhileResolves should stop at first reject', async () => {
    const result = await drainWhileResolves(yield3andReject())

    expect(result.value).toEqual([1, 2])
    expect(result.error?.message).toEqual('oops')
  })

  it('cachedIterator should not enter in deadlock after throwing error in previous iteration', async () => {
    const result = await drainWhileResolves(cachedIterator(yield3andReject, this))
    expect(result.value).toEqual([1, 2])
    expect(result.error?.message).toEqual('oops')

    const result2 = await drainWhileResolves(cachedIterator(yield3andReject, this))
    expect(result2.value).toEqual([1, 2])
    expect(result2.error?.message).toEqual('oops')
  }, 1000)
})
