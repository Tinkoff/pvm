import isRootChanged from '../is-root-changed'

describe('pvm-pkgset/is-root-changed', () => {
  it('should correctly identify whenever root changed', () => {
    const fileList = [
      'packs/multistory/__tests__/generator.test.js',
      'packs/multistory/lib/constants.js',
      'packs/multistory/lib/descriptor.js',
      'packs/multistory/lib/generator.js',
      'packs/multistory/lib/index.js',
    ]

    const wspaces = [
      'packs/block',
      'packs/di',
      'packs/mm',
      'packs/multistory',
      'packs/prop-types',
      'packs/stories-generator',
      'packs/stories-of-block',
      'src/atoms/atom-background-for-block',
      'src/blocks/test-a',
      'src/blocks/test-b',
      'src/blocks/test-product',
    ]

    expect(isRootChanged(wspaces, fileList)).toBe(false)
  })
})
