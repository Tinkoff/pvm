import { pullOutLinks, dottifyList } from '../markdown'
import { nthIndex } from '../index'

describe('text utils', () => {
  it('должен форматировать линки', () => {
    const text = '- [FB-1](https://service.com/browse/FB-1) - где темно, там, где сыро, где пыльно, где мрак.'

    expect(pullOutLinks(text)).toEqual('- https://service.com/browse/FB-1 - где темно, там, где сыро, где пыльно, где мрак.')
  })

  it('меняем списки на точки', () => {
    expect(dottifyList('- test\n- d')).toEqual('• test\n• d')
  })

  it('меняем нумерованные списки на точки', () => {
    expect(dottifyList('1. test\n1. d', '1.')).toEqual('• test\n• d')
  })

  const nthIndexDataset: [string, string, number, number][] = [
    ['abc', 'd', 1, -1],
    ['', 'd', 1, -1],
    ['abc', '', 1, 0],
    ['abc', 'a', 2, -1],
    ['abca', 'a', 2, 3],
    ['abca', 'a', 1, 0],
  ]
  describe('nthIndex', () => {
    nthIndexDataset.forEach((args) => {
      it(`nthIndex(${args.slice(0, -1).join(', ')}) === ${args[3]}`, () => {
        expect(nthIndex(args[0], args[1], args[2])).toEqual(args[3])
      })
    })
  })
})
