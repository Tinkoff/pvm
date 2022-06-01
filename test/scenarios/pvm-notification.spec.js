const path = require('path')
const { runMessengerMocker } = require('../slack-mock')

describe('pvm-notification', () => {
  let slackMocker
  beforeAll(async () => {
    slackMocker = await runMessengerMocker()
  })

  afterEach(() => {
    slackMocker.clear()
  })

  afterAll(() => {
    slackMocker.stop()
  })

  describe('target = all', () => {
    it('should work', async () => {
      const slackRequestsBody = collectSlackRequests(slackMocker)
      const repo = await initRepo('simple-one', {
        notifications: {
          target: 'all',
          clients: [
            {
              name: 'slack',
              pkg: '@pvm/slack',
            },
            {
              name: 'another_slack',
              pkg: '@pvm/slack',
            },
          ],
          client_configs: {
            slack: {
              channel: 'c1',
            },
            another_slack: {
              channel: 'c2',
            },
          },
        },
      })

      await runScript(repo, 'pvm notification send -m hello', {
        env: {
          ...process.env,
          SLACK_API_URL: slackMocker.mockerUrl,
          SLACK_TOKEN: 'test',
        },
      })
      expect(slackRequestsBody.length).toEqual(2)
      expect(slackRequestsBody[0]).toMatchObject({
        channel: 'c1',
        blocks: [{
          'type': 'section',
          'text': {
            'type': 'mrkdwn',
            'text': 'hello',
          },
        }],
      })
      expect(slackRequestsBody[1]).toMatchObject({
        channel: 'c2',
        blocks: [{
          'type': 'section',
          'text': {
            'type': 'mrkdwn',
            'text': 'hello',
          },
        }],
      })
    })

    it('should send all messages and throw error if some failed', async () => {
      const slackRequestsBody = collectSlackRequests(slackMocker)
      const repo = await initRepo('simple-one')
      await repo.linkNodeModules()
      const failingMessengerClientPath = await createFailingMessengerClient(repo)
      await repo.updateConfig({
        notifications: {
          target: 'all',
          clients: [
            {
              name: 'slack',
              pkg: failingMessengerClientPath,
            },
            {
              name: 'another_slack',
              pkg: '@pvm/slack',
            },
          ],
          client_configs: {
            slack: {
              channel: 'c1',
            },
            another_slack: {
              channel: 'c2',
            },
          },
        },
      })

      await expect(runScript(repo, 'pvm notification send -m hello', {
        env: {
          ...process.env,
          SLACK_API_URL: slackMocker.mockerUrl,
          SLACK_TOKEN: 'test',
        },
      })).rejects.toBeTruthy()
      expect(slackRequestsBody.length).toEqual(1)
      expect(slackRequestsBody[0]).toMatchObject({
        channel: 'c2',
      })
    })

    it('should handle common defaults', async () => {
      const slackRequestsBody = collectSlackRequests(slackMocker)
      const repo = await initRepo('simple-one')
      await repo.updateConfig({
        notifications: {
          target: 'all',
          clients: [
            {
              name: 'slack',
              pkg: '@pvm/slack',
            },
            {
              name: 'another_slack',
              pkg: '@pvm/slack',
            },
          ],
          clients_common_config: {
            channel: 'c1',
          },
        },
      })

      await runScript(repo, 'pvm notification send -m hello', {
        env: {
          ...process.env,
          SLACK_API_URL: slackMocker.mockerUrl,
          SLACK_TOKEN: 'test',
        },
      })
      expect(slackRequestsBody.length).toEqual(2)
      expect(slackRequestsBody[0]).toMatchObject({
        channel: 'c1',
      })
      expect(slackRequestsBody[1]).toMatchObject({
        channel: 'c1',
      })
    })
  })

  describe('target = first_available', () => {
    it('should work', async () => {
      const slackRequestsBody = collectSlackRequests(slackMocker)
      const repo = await initRepo('simple-one')
      await repo.linkNodeModules()
      const notReadyMessageClientPath = await createNotReadyMessageClient(repo)
      await repo.updateConfig({
        notifications: {
          target: 'all',
          order: ['slack', 'another_slack'],
          clients: [
            {
              name: 'slack',
              pkg: notReadyMessageClientPath,
            },
            {
              name: 'another_slack',
              pkg: '@pvm/slack',
            },
          ],
          client_configs: {
            slack: {
              channel: 'c1',
            },
            another_slack: {
              channel: 'c2',
            },
          },
        },
      })

      await runScript(repo, 'pvm notification send -m hello', {
        env: {
          ...process.env,
          SLACK_API_URL: slackMocker.mockerUrl,
          SLACK_TOKEN: 'test',
        },
      })
      expect(slackRequestsBody.length).toEqual(1)
      expect(slackRequestsBody[0]).toMatchObject({
        channel: 'c2',
      })
    })
  })

  describe('target = custom', () => {
    it('should work with single target', async () => {
      const slackRequestsBody = collectSlackRequests(slackMocker)
      const repo = await initRepo('simple-one')
      await repo.updateConfig({
        notifications: {
          target: 'another_slack',
          clients: [
            {
              name: 'slack',
              pkg: '@pvm/slack',
            },
            {
              name: 'another_slack',
              pkg: '@pvm/slack',
            },
          ],
          client_configs: {
            slack: {
              channel: 'c1',
            },
            another_slack: {
              channel: 'c2',
            },
          },
        },
      })

      await runScript(repo, 'pvm notification send -m hello', {
        env: {
          ...process.env,
          SLACK_API_URL: slackMocker.mockerUrl,
          SLACK_TOKEN: 'test',
        },
      })
      expect(slackRequestsBody.length).toEqual(1)
      expect(slackRequestsBody[0]).toMatchObject({
        channel: 'c2',
      })
    })

    it('should work with target array', async () => {
      const slackRequestsBody = collectSlackRequests(slackMocker)
      const repo = await initRepo('simple-one')
      await repo.updateConfig({
        notifications: {
          target: ['another_slack', 'slack'],
          clients: [
            {
              name: 'slack',
              pkg: '@pvm/slack',
            },
            {
              name: 'another_slack',
              pkg: '@pvm/slack',
            },
          ],
          client_configs: {
            slack: {
              channel: 'c1',
            },
            another_slack: {
              channel: 'c2',
            },
          },
        },
      })

      await runScript(repo, 'pvm notification send -m hello', {
        env: {
          ...process.env,
          SLACK_API_URL: slackMocker.mockerUrl,
          SLACK_TOKEN: 'test',
        },
      })
      expect(slackRequestsBody.length).toEqual(2)
      expect(slackRequestsBody).toContainEqual(expect.objectContaining({
        channel: 'c2',
      }))
      expect(slackRequestsBody).toContainEqual(expect.objectContaining({
        channel: 'c1',
      }))
    })
  })

  describe('cli', () => {
    describe('common', () => {
      let repo

      const testCLI = testCLIFactory(() => ({ repo, slackMocker }))

      beforeAll(async () => {
        repo = await initRepo('simple-one', {
          notifications: {
            clients: [
              {
                name: 'slack',
                pkg: '@pvm/slack',
              },
              {
                name: 'another_slack',
                pkg: '@pvm/slack',
              },
            ],
            client_configs: {
              slack: {
                channel: 'c1',
              },
              another_slack: {
                channel: 'c2',
              },
            },
          },
        })
      })
      testCLI(
         `pvm notification send -m hello -c test -t all`,
         {
           requestsCount: 2,
           channel: 'test',
           content: 'hello',
         }
      )
      testCLI(
        `pvm notification send -m hello -t another_slack`,
        {
          requestsCount: 1,
          channel: 'c2',
          content: 'hello',
        }
      )

      testCLI(
        `pvm notification send -m hello -t another_slack -t slack`,
        {
          requestsCount: 2,
          channel: ['c2', 'c1'],
          content: 'hello',
        }
      )

      testCLI(
        `pvm notification send -m hello`,
        {
          requestsCount: 1,
          channel: 'c1',
          content: 'hello',
        }
      )

      testCLI(
        `pvm notification send -f msg.json -t slack`,
        {
          requestsCount: 1,
          channel: 'm1',
          content: 'hello',
        },
        {
          message: {
            channel: 'm1',
            content: 'hello',
          },
        }
      )

      testCLI(
        `pvm notification send --channel m1 -t slack`,
        {
          requestsCount: 1,
          channel: 'm1',
          content: 'hello',
        },
        {
          stdin: 'hello',
        }
      )

      testCLI(
        `pvm notification send -c m1 -m - -t slack`,
        {
          requestsCount: 1,
          channel: 'm1',
          content: 'hello',
        },
        {
          stdin: 'hello',
        }
      )
    })

    describe('mattermost', () => {
      let repo

      const testCLI = testCLIFactory(() => ({ repo, slackMocker }))

      beforeAll(async () => {
        repo = await initRepo('simple-one', {
          notifications: {
            clients: [
              {
                name: 'mattermost',
                pkg: '@pvm/mattermost',
              },
            ],
            client_configs: {
              mattermost: {
                channel: 'm1',
              },
            },
          },
        })
      })

      testCLI(
        `pvm notification send -m hello`,
        {
          requestsCount: 1,
          channel: 'm1',
          content: 'hello',
          target: 'mattermost',
        }
      )

      testCLI(
        `pvm notification send -f msg.json`,
        {
          requestsCount: 1,
          channel: 'm1',
          content: 'hello',
          target: 'mattermost',
          attachments: [{
            title: 'attachment',
            text: 'text',
          }],
        },
        {
          message: {
            content: 'hello',
            attachments: [{
              title: 'attachment',
              text: 'text',
            }],
          },
        }
      )

      testCLI(
        `pvm notification send -m ${Array(4100).fill('a').join('')}`,
        {
          requestsCount: 1,
          channel: 'm1',
          content: `${Array(3995).fill('a').join('')}\n...`,
          target: 'mattermost',
        }
      )

      testCLI(
        `pvm notification send -m test`,
        {
          requestsCount: 1,
          channel: 'm1',
          content: `test`,
          target: 'mattermost',
          stderr: /Retrieving channel id from channel name failed/,
        }, {
          testName: 'should send message with passed channel if retrieve channel id by name failed',
          env: {
            PVM_MATTERMOST_TEAM: 'test',
          },
        }
      )

      testCLI(
        `pvm notification send -m test`,
        {
          requestsCount: 1,
          channel: 'm1',
          content: `test`,
          target: 'mattermost',
        }, {
          testName: 'should send message via INCOMING_WEBHOOK',
          env: {
            PVM_MATTERMOST_TOKEN: '',
            PVM_MATTERMOST_URL: '',
            PVM_MATTERMOST_INCOMING_WEBHOOK: 'PVM_MATTERMOST_INCOMING_WEBHOOK',
          },
        }
      )
    })

    describe('slack', () => {
      let repo

      const testCLI = testCLIFactory(() => ({
        repo,
        slackMocker,
      }))

      beforeAll(async () => {
        repo = await initRepo('simple-one', {
          notifications: {
            clients: [
              {
                name: 'slack',
                pkg: '@pvm/slack',
              },
            ],
            client_configs: {
              slack: {
                channel: 'c1',
              },
            },
          },
        })
      })

      it('should be backward compatible with slack_nofitication', async () => {
        const slackRequestsBody = collectSlackRequests(slackMocker)
        const repo = await initRepo('simple-one')
        await repo.updateConfig({
          slack_notification: {
            channel: 'c2',
            username: 'pfpa-tools deploy',
            icon_emoji: ':hammer_and_wrench:',
          },
          notifications: {
            target: ['slack'],
            clients: [
              {
                name: 'slack',
                pkg: '@pvm/slack',
              },
            ],
          },
        })

        await runScript(repo, 'pvm notification send -m hello', {
          env: {
            ...process.env,
            SLACK_API_URL: slackMocker.mockerUrl,
            SLACK_TOKEN: 'test',
          },
        })
        expect(slackRequestsBody.length).toEqual(1)
        expect(slackRequestsBody[0]).toMatchObject({
          channel: 'c2',
          username: 'pfpa-tools deploy',
          icon_emoji: ':hammer_and_wrench:',
        })
      })

      testCLI(
        `pvm notification send -m hello`,
        {
          requestsCount: 1,
          channel: 'c1',
          content: 'hello',
          target: 'slack',
        }
      )

      testCLI(
        `pvm notification send -f msg.json`,
        {
          requestsCount: 1,
          channel: 'c1',
          content: 'hello',
          target: 'slack',
        },
        {
          message: {
            content: 'hello',
            attachments: [{
              title: 'attachment',
              text: 'text',
            }],
          },
        }
      )

      testCLI(
        `pvm notification send -m **markdown**`,
        {
          requestsCount: 1,
          channel: 'c1',
          content: '​*markdown*​',
          target: 'slack',
        }
      )

      testCLI(
        `pvm notification send -f msg.json`,
        {
          requestsCount: 1,
          channel: 'c1',
          content: 'hello',
          target: 'slack',
          attachments: [{
            title: '​*attachment*​',
            text: '​*text*​',
            obj: {
              test: 123,
            },
          }],
        },
        {
          message: {
            content: 'hello',
            attachments: [{
              title: '**attachment**',
              text: '**text**',
              obj: {
                test: 123,
              },
            }],
          },
        }
      )
    })
  })
})

function collectSlackRequests(slackMocker) {
  const slackRequestsBody = []
  slackMocker.spy((req) => {
    slackRequestsBody.push(req.body)
  })
  return slackRequestsBody
}

async function createFailingMessengerClient(repo) {
  const fileName = 'broken_messenger_client.js'
  await repo.writeFile(fileName, `
const AbstractMessengerClient = require('@pvm/notifications').AbstractMessengerClient
module.exports.MessengerClient = class Client extends AbstractMessengerClient {
  isReady() { return true }
  async internalSendMessage() {
    throw new Error('Send failed')
  }
}
    `)

  return path.join(repo.cwd, fileName)
}

async function createNotReadyMessageClient(repo) {
  const fileName = 'broken_messenger_client.js'
  await repo.writeFile(fileName, `
const AbstractMessengerClient = require('@pvm/notifications').AbstractMessengerClient
module.exports.MessengerClient = class Client extends AbstractMessengerClient {
  isReady() { return false }
  internalSendMessage() {

  }
}
    `)

  return path.join(repo.cwd, fileName)
}

function testCLIFactory(contextReceiver) {
  return function testCLI(
    cmd, conditions, inputConfig = {}
  ) {
    const {
      requestsCount,
      content,
      attachments,
      channel,
      target,
      stderr,
    } = conditions
    const {
      env,
      testName,
      message,
      stdin,
    } = inputConfig
    // eslint-disable-next-line jest/valid-title
    it(testName ?? cmd.substring(0, 1000), async () => {
      const { repo, slackMocker } = contextReceiver()
      if (message) {
        repo.writeFile('msg.json', JSON.stringify(message))
      }

      const slackRequestsBody = collectSlackRequests(slackMocker)
      const webhookMode = env?.PVM_MATTERMOST_INCOMING_WEBHOOK
      const { stderr: resultStdErr } = await execScript(repo, cmd, {
        input: stdin,
        env: {
          ...process.env,
          PVM_MATTERMOST_URL: slackMocker.mockerUrl,
          PVM_MATTERMOST_TOKEN: 'test',
          SLACK_API_URL: slackMocker.mockerUrl,
          SLACK_TOKEN: 'test',
          ...env,
          ...(webhookMode ? { PVM_MATTERMOST_INCOMING_WEBHOOK: slackMocker.mockerUrl } : {}),
        },
      })
      slackMocker.clear()

      if (requestsCount !== undefined) {
        // eslint-disable-next-line jest/no-conditional-expect
        expect(slackRequestsBody.length).toEqual(requestsCount)
      }

      if (stderr !== undefined) {
        // eslint-disable-next-line jest/no-conditional-expect
        expect(resultStdErr).toMatch(stderr)
      }

      if (content !== undefined || channel !== undefined) {
        slackRequestsBody.forEach((body, i) => {
          const appliedTarget = Array.isArray(target) ? target[i] : target
          const appliedChannel = Array.isArray(channel) ? channel[i] : channel
          // eslint-disable-next-line jest/no-conditional-expect
          expect(body).toMatchObject({
            ...(content !== undefined ? messageByTarget(appliedTarget, content, { webhookMode }) : {}),
            ...(channel !== undefined ? channelByTarget(appliedTarget, appliedChannel, { webhookMode }) : {}),
            ...(attachments !== undefined ? attachmentsByTarget(appliedTarget, attachments) : {}),
          })
        })
      }
    })
  }
}

function messageByTarget(target, content, { webhookMode } = {}) {
  switch (target) {
    case 'mattermost':
      return {
        [webhookMode ? 'text' : 'message']: content,
      }
    case 'slack':
    default:
      return {
        blocks: [{
          'type': 'section',
          'text': {
            'type': 'mrkdwn',
            'text': `${content}`,
          },
        }],
      }
  }
}

function channelByTarget(target, channel, { webhookMode } = {}) {
  switch (target) {
    case 'mattermost':
      return {
        [webhookMode ? 'channel' : 'channel_id']: channel,
      }
    case 'slack':
    default:
      return {
        channel,
      }
  }
}

function attachmentsByTarget(target, attachments) {
  switch (target) {
    case 'mattermost':
      return {
        props: {
          attachments,
        },
      }
    case 'slack':
    default:
      return {
        attachments,
      }
  }
}
