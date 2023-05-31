import initRepo from '../../../../../test/initRepo'
import { VCS_PLATFORM_FACTORY_TOKEN } from '../../../tokens'
import { GlobalFlags } from '../../../lib/cli/global-flags'

describe('vcs', () => {
  it('should rollback commits', async () => {
    const repo = await initRepo('monorepo-new')
    const vcsFactory = repo.di.get(VCS_PLATFORM_FACTORY_TOKEN)

    const globalFlags = new GlobalFlags()
    globalFlags.setFlag('localMode', true)
    const vcs = vcsFactory({
      globalFlags,
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
