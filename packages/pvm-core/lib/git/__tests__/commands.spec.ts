import { extractDomain } from '../commands'

describe('extractDomain', () => {
  it('extractDomain should extract domain from git ssh url', () => {
    expect(extractDomain('git@gitlab.foo.com/test/test-project.git')).toEqual('gitlab.foo.com')
  })

  it('extractDomain should cut port from url', () => {
    expect(extractDomain('git@gitlab.foo.com:7999/test/test-project.git')).toEqual('gitlab.foo.com')
  })
})
