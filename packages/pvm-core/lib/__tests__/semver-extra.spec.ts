import { releaseTypes } from '../semver-extra'

describe('core/semver-extra', () => {
  it('releasetypes/max', () => {
    expect(releaseTypes.max('minor', 'premajor', 'prepatch')).toEqual('premajor')
  })
})
