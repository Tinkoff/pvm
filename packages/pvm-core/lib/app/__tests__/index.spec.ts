import { Pvm } from '../index'
import { provide } from '@pvm/di'
import path from 'path'
import { CONFIG_TOKEN } from '@pvm/tokens-core'

describe('@pvm/container', () => {
  afterEach(() => {
    // eslint-disable-next-line pvm/no-process-env
    delete process.env['PVM_CONFIG__MARK_PR__ANALYZE_UPDATE']
  })

  it('should work with provided deps', () => {
    const pvmContainer = new Pvm({
      config: {
        plugins_v2: [{
          plugin: () => ({
            providers: [
              provide({
                provide: 'test',
                useValue: 'test value',
              }),
            ],
          }),
        }],
      },
    })
    expect(pvmContainer.container.get('test')).toBe('test value')
  })

  it('should handle direct factories', async () => {
    const pvmContainer = new Pvm({
      plugins: [{
        plugin: () => ({
          providers: [provide({
            provide: 'test',
            useValue: 'test value',
          })],
        }),
      }],
    })

    expect(pvmContainer.container.get('test')).toBe('test value')
  })

  it('should load nested plugins', async () => {
    const pvmContainer = new Pvm({
      config: {
        plugins_v2: [{
          plugin: path.join(__dirname, '__fixtures__', 'plugin-with-config-with-plugins.js'),
        }],
      },
    })

    expect(pvmContainer.container.get(CONFIG_TOKEN)).toMatchObject({
      plugins_v2: [{
        plugin: require.resolve('@pvm/plugin-gitlab'),
      }, {
        plugin: path.join(__dirname, '__fixtures__', 'plugin-with-config-with-plugins.js'),
      }, {
        plugin: './plugin-with-config-extension.js',
      }],
      mark_pr: {
        analyze_update: true,
      },
    })
  })

  it('should give envs top priority', () => {
    // eslint-disable-next-line pvm/no-process-env
    process.env['PVM_CONFIG__MARK_PR__ANALYZE_UPDATE'] = 'true'

    const pvmContainer = new Pvm({
      config: {
        mark_pr: {
          analyze_update: false,
        },
      },
    })

    expect(pvmContainer.container.get(CONFIG_TOKEN).mark_pr.analyze_update).toBe(true)
  })

  it('should give user config priority against plugins', () => {
    const pvmContainer = new Pvm({
      config: {
        mark_pr: {
          analyze_update: false,
        },
        plugins_v2: [{
          plugin: {
            configExt: {
              mark_pr: {
                analyze_update: true,
              },
            },
          },
        }],
      },
    })

    expect(pvmContainer.container.get(CONFIG_TOKEN).mark_pr.analyze_update).toBe(false)
  })
})
