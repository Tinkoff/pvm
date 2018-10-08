import { releaseMessage } from '../message-builder'

describe('notifications/message-builder', () => {
  it('should take full tag for simple repositories', async () => {
    // @ts-ignore
    const repo = await initRepo('simple-one')

    const message = releaseMessage({
      tag: 'v0.1.0',
      commits: [],
      targetType: 'slack',
      packagesStats: {
        success: [],
        error: [],
        skipped: [],
      },
      pvmConfig: repo.config,
    })

    // @ts-ignore
    expect(message.content).toEqual('v0.1.0 has been released')
  })

  it('should get part of release tag in case of monorepository', async () => {
    // @ts-ignore
    const repo = await initRepo('monorepo-new')

    const message = releaseMessage({
      tag: 'release-2020.02.02-moon',
      commits: [],
      targetType: 'slack',
      packagesStats: {
        success: [],
        error: [],
        skipped: [],
      },
      pvmConfig: repo.config,
    })

    // @ts-ignore
    expect(message.content).toEqual('moon has been released')
  })
})
