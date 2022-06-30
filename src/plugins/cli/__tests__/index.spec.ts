import { Pvm } from '@pvm/core/lib/app'
import { CLI_EXTENSION_TOKEN, CLI_TOKEN } from '@pvm/tokens-cli'
import PvmCliPlugin from '@pvm/plugin-cli'
import { provide } from '@pvm/di'

describe('@pvm/cli', () => {
  it('should run provided command', () => {
    const outputStore = ''
    const pvm = new Pvm({
      plugins: [{
        plugin: PvmCliPlugin,
      }, {
        plugin: () => ({
          providers: [provide({
            provide: CLI_EXTENSION_TOKEN,
            useValue: {
              command: 'cli-test',
              description: 'test command',
              handler: () => {
                const outputStore = 'command works!\n'
                process.stdout.write(outputStore)
              },
            },
            multi: true,
          })],
        }),
      }],
    })

    pvm.container.get(CLI_TOKEN)({ argv: ['node.exe', 'path-to-script.js', 'cli-test'] })

    expect(outputStore).toBe('command works!\n')
  })
})