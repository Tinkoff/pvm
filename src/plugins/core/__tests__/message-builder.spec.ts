import { releaseMessage } from '../messages/message-builder'
import { env } from '@pvm/core/lib/env'

describe('notifications/message-builder', () => {
  const ciPipelineUrl = env.CI_PIPELINE_URL
  afterEach(() => {
    env.CI_PIPELINE_URL = !ciPipelineUrl ? '' : ciPipelineUrl
  })

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

  it('should add error info if publish failed partially', async () => {
    // @ts-ignore
    const repo = await initRepo('monorepo-new')

    const message = releaseMessage({
      tag: 'release-2020.02.02-moon',
      commits: [],
      targetType: 'slack',
      packagesStats: {
        success: [{
          pkg: 'b',
          type: 'success',
          publishedVersion: '1.0.0',
          registryVersion: '0.0.0',
        }],
        error: [{
          pkg: 'a',
          reason: 'error',
          type: 'failed',
          publishVersion: '1.0.0',
        }],
        skipped: [],
      },
      pvmConfig: repo.config,
    })

    expect(message.content).toEqual(':warning: moon partially failed to release')
  })

  it('should add error info if publish fully failed', async () => {
    // @ts-ignore
    const repo = await initRepo('monorepo-new')

    const message = releaseMessage({
      tag: 'release-2020.02.02-moon',
      commits: [],
      targetType: 'slack',
      packagesStats: {
        success: [],
        error: [{
          pkg: 'a',
          reason: 'error',
          type: 'failed',
          publishVersion: '1.0.0',
        }],
        skipped: [],
      },
      pvmConfig: repo.config,
    })

    expect(message.content).toEqual(':warning: moon failed to release')
  })

  it('should add pipeline url to error title', async () => {
    env.CI_PIPELINE_URL = 'test'
    // @ts-ignore
    const repo = await initRepo('monorepo-new')

    const message = releaseMessage({
      tag: 'release-2020.02.02-moon',
      commits: [],
      targetType: 'slack',
      packagesStats: {
        success: [],
        error: [{
          pkg: 'a',
          reason: 'error',
          type: 'failed',
          publishVersion: '1.0.0',
        }],
        skipped: [],
      },
      pvmConfig: repo.config,
    })

    expect(message.content).toEqual(':warning: moon failed to release ([pipeline](test))')
  })
})
