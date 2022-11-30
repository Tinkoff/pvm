import { Pvm } from '../app'
import { CLI_EXTENSION_TOKEN, CLI_TOKEN } from '../tokens'
import { provide } from '../lib/di'

describe('@pvm/cli', () => {
  it('should run provided command', () => {
    let outputStore = ''
    const pvm = new Pvm({
      plugins: [{
        plugin: () => ({
          providers: [provide({
            provide: CLI_EXTENSION_TOKEN,
            useValue: {
              command: 'cli-test',
              description: 'test command',
              handler: () => {
                outputStore = 'command works!\n'
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