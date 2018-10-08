import { expDropRight } from '../array'

function * nGen(n: number, startFrom = 0): IterableIterator<number> {
  for (let i = startFrom; i < startFrom + n; i++) {
    yield i
  }
}

function makeNArray(n: number, startFrom = 0): number[] {
  return Array.from(nGen(n, startFrom))
}

describe('utils/array', () => {
  describe('expDropRight', () => {
    it('should handle empty array', () => {
      expect(expDropRight([], () => true)).toEqual([])
      expect(expDropRight([], () => false)).toEqual([])
    })

    it('should handle 1-element array', () => {
      expect(expDropRight([2], () => true)).toEqual([2])
      expect(expDropRight([1], () => false)).toEqual([])
    })

    it('should handle n-size array', () => {
      const probesLen = [2, 6, 7, 8, 10, 20, 25]
      for (const N of probesLen) {
        for (let i = 1; i <= N; i++) {
          const arr = makeNArray(N, 0)
          expect(expDropRight(arr, (n) => n < i)).toEqual(arr.filter(n => n < i))
        }
      }
    })
  })
})
