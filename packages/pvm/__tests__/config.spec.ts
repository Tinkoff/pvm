import type { Config } from '../types'
import { readEnv, migrateDeprecated } from '../lib/config/get-config'

describe('pvm/config', () => {
  it('should correctly read variables from env', () => {
    const testEnv = {
      'PVM_CONFIG__UPDATE__COMMIT_VIA_PLATFORM': 'false',
    }

    const settings = readEnv(testEnv)

    expect(settings).toEqual({
      update: {
        commit_via_platform: false,
      },
    })
  })

  it('should migrate deprecated values', () => {
    const config = {
      slack_notification: {
        channel: 'test',
        username: 'user',
        icon_emoji: 'icon',
      },
      publish: {
        enabled_only_for: ['src/c', 'src/b'],
        disabled_for: ['src/c', 'src/b'],
      },
      release: {},
      tagging: {
        unified_tag: {
          date_format: 'yyyy.MM.dd',
          suffixes: ['apple', 'banana', 'orange'],
        },
      },
      changelog: {
        renderer: 'builtin.list',
        for_packages: {
          renderer: 'builtin.list-with-packages',
        },
      },
    }

    migrateDeprecated(config as unknown as Config)

    expect(config).toEqual({
      notifications: {
        clients_common_config: {
          channel: 'test',
          author: {
            name: 'user',
            avatarEmoji: 'icon',
          },
        },
      },
      publish: {
        enabled_only_for: ['/src/c', '/src/b'],
        disabled_for: ['/src/c', '/src/b'],
      },
      release: {},
      tagging: {
        suffixes: ['apple', 'banana', 'orange'],
        generic_tag: {
          date_format: 'yyyy.MM.dd',
        },
      },
      changelog: {
        renderer: {
          type: 'builtin.list',
          show_date: true,
          tag_head_level: 2,
        },
        for_packages: {
          renderer: {
            type: 'builtin.list-with-packages',
            show_date: true,
            tag_head_level: 2,
          },
        },
      },
    })
  })
})
