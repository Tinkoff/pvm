import { VCS_PLATFORM_FACTORY_TOKEN } from '../../../tokens'

describe('vcs', () => {
  it('should rollback commits', async () => {
    // @ts-ignore
    const repo = await initRepo('monorepo-new')
    const vcsFactory = repo.di.get(VCS_PLATFORM_FACTORY_TOKEN)

    const vcs = vcsFactory({
      localMode: true,
      vcsMode: 'vcs',
    })
    const commitContext = await vcs.beginCommit()

    const initialRev = repo.shell('git rev-parse HEAD')

    await repo.touch('foo')
    await vcs.addFiles(['foo'])
    await vcs.commit('commit foo')

    await vcs.rollbackCommit(commitContext)

    expect(repo.shell('git rev-parse HEAD')).toEqual(initialRev)
  })
})
