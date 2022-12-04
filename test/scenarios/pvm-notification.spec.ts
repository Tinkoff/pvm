import type { SlackMock } from '../slack-mock'
import { runMessengerMocker } from '../slack-mock'

import path from 'path'
import { execScript, runScript } from '../executors'
import initRepo from '../initRepo'
import type { Message } from '@pvm/pvm'
import type { Request, Response } from 'express'
import type { RepoTestApi } from '../types'

describe('pvm-notification', () => {
  let slackMocker: SlackMock
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
      const slackRequests = collectSlackRequests(slackMocker)
      const repo = await initRepo('simple-one', {
        notifications: {
          target: 'all',
          client_configs: {
            slack: {
              channel: 'c1',
            },
            another_slack: {
              channel: 'c2',
            },
          },
        },
        plugins_v2: [{
          plugin: '@pvm/plugin-slack',
          options: {
            name: 'slack',
          },
        },
        {
          plugin: '@pvm/plugin-slack',
          options: {
            name: 'another_slack',
          },
        }],
      })

      await runScript(repo, 'pvm notification send -m hello', {
        env: {
          ...process.env,
          SLACK_API_URL: slackMocker.mockerUrl,
          SLACK_TOKEN: 'test',
        },
      })
      expect(slackRequests.length).toEqual(2)
      expect(slackRequests.map(r => r.body)).toEqual(expect.arrayContaining([expect.objectContaining({
        channel: 'c1',
        blocks: [{
          'type': 'section',
          'text': {
            'type': 'mrkdwn',
            'text': 'hello',
          },
        }],
      }), expect.objectContaining({
        channel: 'c2',
        blocks: [{
          'type': 'section',
          'text': {
            'type': 'mrkdwn',
            'text': 'hello',
          },
        }],
      })]))
    })

    it('should send all messages and throw error if some failed', async () => {
      const slackRequests = collectSlackRequests(slackMocker)
      const repo = await initRepo('simple-one')
      await repo.linkNodeModules()
      const failingMessengerClientPath = await createFailingMessengerClient(repo)
      await repo.updateConfig({
        notifications: {
          target: 'all',
          client_configs: {
            slack: {
              channel: 'c1',
            },
            another_slack: {
              channel: 'c2',
            },
          },
        },
        plugins_v2: [{
          plugin: '@pvm/plugin-slack',
          options: {
            name: failingMessengerClientPath,
          },
        },
        {
          plugin: '@pvm/plugin-slack',
          options: {
            name: 'another_slack',
          },
        }],
      })

      await expect(runScript(repo, 'pvm notification send -m hello', {
        env: {
          ...process.env,
          SLACK_API_URL: slackMocker.mockerUrl,
          SLACK_TOKEN: 'test',
        },
      })).rejects.toBeTruthy()
      expect(slackRequests.length).toEqual(1)
      expect(slackRequests[0].body).toMatchObject({
        channel: 'c2',
      })
    })

    it('should handle common defaults', async () => {
      const slackRequests = collectSlackRequests(slackMocker)
      const repo = await initRepo('simple-one')
      await repo.updateConfig({
        notifications: {
          target: 'all',
          clients_common_config: {
            channel: 'c1',
          },
        },
        plugins_v2: [{
          plugin: '@pvm/plugin-slack',
          options: {
            name: 'slack',
          },
        },
        {
          plugin: '@pvm/plugin-slack',
          options: {
            name: 'another_slack',
          },
        }],
      })

      await runScript(repo, 'pvm notification send -m hello', {
        env: {
          ...process.env,
          SLACK_API_URL: slackMocker.mockerUrl,
          SLACK_TOKEN: 'test',
        },
      })
      expect(slackRequests.length).toEqual(2)
      expect(slackRequests[0].body).toMatchObject({
        channel: 'c1',
      })
      expect(slackRequests[1].body).toMatchObject({
        channel: 'c1',
      })
    })
  })

  describe('target = first_available', () => {
    it('should work', async () => {
      const slackRequests = collectSlackRequests(slackMocker)
      const repo = await initRepo('simple-one')
      await repo.linkNodeModules()
      const notReadyMessageClientPath = await createNotReadyMessageClient(repo)
      await repo.updateConfig({
        notifications: {
          target: 'all',
        },
        plugins_v2: [{
          plugin: notReadyMessageClientPath,
          options: {
            name: 'slack',
          },
        },
        {
          plugin: '@pvm/plugin-slack',
          options: {
            name: 'another_slack',
          },
        }],
      })

      await runScript(repo, 'pvm notification send -m hello', {
        env: {
          ...process.env,
          SLACK_API_URL: slackMocker.mockerUrl,
          SLACK_TOKEN: 'test',
        },
      })
      expect(slackRequests.length).toEqual(1)
      expect(slackRequests[0].body).toMatchObject({
        channel: 'c2',
      })
    })
  })

  describe('target = custom', () => {
    it('should work with single target', async () => {
      const slackRequests = collectSlackRequests(slackMocker)
      const repo = await initRepo('simple-one')
      await repo.updateConfig({
        notifications: {
          target: 'another_slack',
          client_configs: {
            slack: {
              channel: 'c1',
            },
            another_slack: {
              channel: 'c2',
            },
          },
        },
        plugins_v2: [{
          plugin: '@pvm/plugin-slack',
          options: {
            name: 'slack',
          },
        },
        {
          plugin: '@pvm/plugin-slack',
          options: {
            name: 'another_slack',
          },
        }],
      })

      await runScript(repo, 'pvm notification send -m hello', {
        env: {
          ...process.env,
          SLACK_API_URL: slackMocker.mockerUrl,
          SLACK_TOKEN: 'test',
        },
      })
      expect(slackRequests.length).toEqual(1)
      expect(slackRequests[0].body).toMatchObject({
        channel: 'c2',
      })
    })

    it('should work with target array', async () => {
      const slackRequests = collectSlackRequests(slackMocker)
      const repo = await initRepo('simple-one')
      await repo.updateConfig({
        notifications: {
          target: ['another_slack', 'slack'],
          client_configs: {
            slack: {
              channel: 'c1',
            },
            another_slack: {
              channel: 'c2',
            },
          },
        },
        plugins_v2: [{
          plugin: '@pvm/plugin-slack',
          options: {
            name: 'slack',
          },
        },
        {
          plugin: '@pvm/plugin-slack',
          options: {
            name: 'another_slack',
          },
        }],
      })

      await runScript(repo, 'pvm notification send -m hello', {
        env: {
          ...process.env,
          SLACK_API_URL: slackMocker.mockerUrl,
          SLACK_TOKEN: 'test',
        },
      })
      expect(slackRequests.length).toEqual(2)
      expect(slackRequests).toContainEqual(expect.objectContaining({
        body: expect.objectContaining({
          channel: 'c2',
        }),
      }))
      expect(slackRequests).toContainEqual(expect.objectContaining({
        body: expect.objectContaining({
          channel: 'c1',
        }),
      }))
    })
  })

  describe('cli', () => {
    describe('common', () => {
      let repo: RepoTestApi

      const testCLI = testCLIFactory(() => ({ repo, slackMocker }))

      beforeAll(async () => {
        repo = await initRepo('simple-one', {
          plugins_v2: [
            {
              plugin: '@pvm/plugin-slack',
              options: {
                channel: 'c1',
              },
            },
            {
              plugin: '@pvm/plugin-slack',
              options: {
                name: 'another_slack',
                channel: 'c2',
              },
            },
          ],
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
      let repo: RepoTestApi

      const testCLI = testCLIFactory(() => ({ repo, slackMocker }))

      beforeAll(async () => {
        repo = await initRepo('simple-one', {
          plugins_v2: [
            {
              plugin: '@pvm/plugin-mattermost',
              options: {
                channel: 'm1',
              },
            },
          ],
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

      testCLI(
        `pvm notification send -m test`,
        {
          // two unsuccessful requests and one successful
          requestsCount: 3,
        }, {
          testName: 'should retry requests with 408 response code',
          statusCode({ reqIndex }) {
            if (reqIndex === 2) {
              return 200
            }

            return 408
          },
        }
      )

      testCLI(
        `pvm notification send -m test`,
        {
          stderr: /responseCode = 500/,
        }, {
          testName: 'should immediately fail on other than 408 response codes',
          statusCode() {
            return 500
          },
        }
      )
    })

    describe('slack', () => {
      let repo: RepoTestApi

      const testCLI = testCLIFactory(() => ({
        repo,
        slackMocker,
      }))

      beforeAll(async () => {
        repo = await initRepo('simple-one', {
          plugins_v2: [
            {
              plugin: '@pvm/plugin-slack',
              options: {
                channel: 'c1',
              },
            },
          ],
        })
      })

      it('should be backward compatible with slack_nofitication', async () => {
        const slackRequests = collectSlackRequests(slackMocker)
        const repo = await initRepo('simple-one', {
          plugins_v2: [
            {
              plugin: '@pvm/plugin-slack',
            },
          ],
        })
        await repo.updateConfig({
          slack_notification: {
            channel: 'c2',
            username: 'pfpa-tools deploy',
            icon_emoji: ':hammer_and_wrench:',
          },
          notifications: {
            target: ['slack'],
          },
        })

        await runScript(repo, 'pvm notification send -m hello', {
          env: {
            ...process.env,
            SLACK_API_URL: slackMocker.mockerUrl,
            SLACK_TOKEN: 'test',
          },
        })
        expect(slackRequests.length).toEqual(1)
        expect(slackRequests[0].body).toMatchObject({
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
          }],
        },
        {
          message: {
            content: 'hello',
            attachments: [{
              title: '**attachment**',
              text: '**text**',
            }],
          },
        }
      )
    })
  })
})

function collectSlackRequests(slackMocker: SlackMock, cb: ({ body, res, reqIndex }: { body: any, res: Response, reqIndex: number }) => void = () => {}) {
  const slackRequests: { body: Record<string, any>, res: Response }[] = []
  let reqIndex = 0
  slackMocker.spy((req: Request, res: Response) => {
    slackRequests.push({ body: req.body, res })

    // eslint-disable-next-line node/no-callback-literal
    cb({ body: req.body, res, reqIndex })

    reqIndex++
  })
  return slackRequests
}

async function createFailingMessengerClient(repo: RepoTestApi) {
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

async function createNotReadyMessageClient(repo: RepoTestApi) {
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

function testCLIFactory(contextReceiver: () => { repo: RepoTestApi, slackMocker: SlackMock }) {
  return function testCLI(
    cmd: string, conditions: Partial<{
      requestsCount: number,
      content: string,
      attachments: Message['attachments'],
      channel: string | string[],
      target: string,
      stderr: string | RegExp
    }>,
    inputConfig: Partial<{ env: Record<string, string>, testName: string, message: Record<string, any>, stdin: string, statusCode: (opts: { body: Record<string, any>, res: Response, reqIndex: number}) => number, only: boolean }> = {}
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
      statusCode,
      only,
    } = inputConfig;
    // eslint-disable-next-line jest/valid-title
    (only ? it.only : it)(testName ?? cmd.substring(0, 1000), async () => {
      const { repo, slackMocker } = contextReceiver()
      if (message) {
        repo.writeFile('msg.json', JSON.stringify(message))
      }

      const slackRequests = collectSlackRequests(slackMocker, ({ body, res, reqIndex }) => {
        if (statusCode) {
          res.status(statusCode({ body, res, reqIndex }))
        }
      })
      const webhookMode = !!env?.PVM_MATTERMOST_INCOMING_WEBHOOK
      let procStderr
      try {
        const proc = await execScript(repo, cmd, {
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
        procStderr = proc.stderr
      } catch (e: any) {
        procStderr = e.stderr
      }
      slackMocker.clear()

      if (requestsCount !== undefined) {
        // eslint-disable-next-line jest/no-conditional-expect
        expect(slackRequests.length).toEqual(requestsCount)
      }

      if (stderr !== undefined) {
        // eslint-disable-next-line jest/no-conditional-expect
        expect(procStderr).toMatch(stderr)
      }

      if (content !== undefined || channel !== undefined) {
        slackRequests.forEach(({ body }, i) => {
          const appliedTarget = Array.isArray(target) ? target[i] : target
          const appliedChannel = Array.isArray(channel) ? channel[i] : channel

          if (!appliedChannel) {
            throw new Error('Requests more than messengers')
          }

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

function messageByTarget(target: 'mattermost' | 'slack', content: string, { webhookMode }: { webhookMode?: boolean } = {}) {
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

function channelByTarget(target: 'mattermost' | 'slack', channel: string, { webhookMode }: { webhookMode?: boolean } = {}) {
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

function attachmentsByTarget(target: 'mattermost' | 'slack', attachments: Message['attachments']) {
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
