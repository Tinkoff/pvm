
import { lastReleaseTag } from '../last-release-tag'

describe('last-release-tag', () => {
  // covers PVM-144
  it('should take lrt from master in case first-parent in merge commit leads to branch', async () => {
    // @ts-ignore
    const repo = await initRepo('simple-one')
    await repo.tag('v0.1.0')
    const firstReleasedSha = repo.head
    await repo.touch('m1', 'm1')
    await repo.touch('m2', 'm2')
    await repo.tag('v0.2.0')
    await repo.runScript('git reset --hard HEAD')

    await repo.runScript(`git checkout -b feature ${firstReleasedSha}`)
    await repo.touch('b1', 'b1')
    await repo.touch('b2', 'b2')
    await repo.runScript(`git merge --no-ff master`)
    await repo.touch('b3', 'b3')

    expect(lastReleaseTag(repo.config)).toEqual('v0.2.0')
  })

  it.skip('TODO: cover PVM-149 case', () => {})

  it.skip('TODO: cover PVM-139 case', () => {})
})
