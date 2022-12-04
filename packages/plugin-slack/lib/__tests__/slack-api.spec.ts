// eslint-disable-next-line node/no-extraneous-import,import/no-extraneous-dependencies
import nock from 'nock'
import { sendMessage } from '../api'

describe('slack-api', () => {
  beforeAll(() => {
    nock.disableNetConnect()
  })

  afterAll(() => {
    nock.enableNetConnect()
  })

  it('should read PVM_-prefixied env variables', async () => {
    const scope = nock('https://slack.com/api')
      .post('/chat.postMessage')
      .reply(200, { ok: true })

    await sendMessage({ text: 'hello world' }, {
      env: {
        PVM_SLACK_TOKEN: 'xoxb-test-token',
      },
    })

    expect(scope.isDone()).toBe(true)
  })
})
