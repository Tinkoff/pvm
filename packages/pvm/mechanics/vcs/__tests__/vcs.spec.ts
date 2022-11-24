import { initVcsPlatform } from '../vcs'

describe('vcs', () => {
  it('should rollback commits', async () => {
    // @ts-ignore
    const repo = await initRepo('monorepo-new')

    const vcs = await initVcsPlatform(repo.di, {
      localMode: true,
      vcsMode: 'vcs',
      cwd: repo.dir,
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
