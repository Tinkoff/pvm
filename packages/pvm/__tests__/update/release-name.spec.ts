import { addSuffixToSemverTagName } from '../../mechanics/update/release-name'
import initRepo from '../../../../test/initRepo'

describe('release-name', () => {
  describe('addSuffixToSemverTagName', () => {
    it('should add new suffixes', async () => {
      const repo = await initRepo('simple-one', {
        versioning: {
          source: 'tag',
        },
      })

      await repo.tag('v1.0.0')
      const newTag = addSuffixToSemverTagName(repo.config, 'simple-one', 'v1.0.0')
      expect(newTag).not.toEqual('v1.0.0')
      await repo.touch('n1', 'next version')
      await repo.tag(newTag)

      await repo.touch('n2', 'next version')
      // @ts-ignore
      global.__PVM_TEST_CASE_002_THROW_AT_RANDOM_WORD = true
      const nextTag = addSuffixToSemverTagName(repo.config, 'simple-one', 'v1.0.0')
      // @ts-ignore
      delete global.__PVM_TEST_CASE_002_THROW_AT_RANDOM_WORD
      expect(nextTag).not.toEqual(newTag)
    })
  })
})
