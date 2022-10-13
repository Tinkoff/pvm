import { declarePlugin, provide } from '@pvm/di'
import { CLI_EXTENSION_TOKEN, CLI_TOKEN } from '@pvm/tokens-cli'
import { runCli } from './cli-runner'

export default declarePlugin({
  factory: function() {
    return {
      providers: [
        provide({
          provide: CLI_TOKEN,
          useFactory({ cliExtensions }) {
            return ({ argv }: { argv: string[] }) => runCli(cliExtensions ?? [], argv)
          },
          deps: {
            cliExtensions: { token: CLI_EXTENSION_TOKEN, optional: true, multi: true } as const,
          },
        }),
      ],
    }
  },
})
