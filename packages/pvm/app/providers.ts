import { provide } from '../lib/di'
import { CLI_EXTENSION_TOKEN, GLOBAL_FLAGS_TOKEN, CLI_TOKEN } from '../tokens'

import { runCli } from '../lib/cli/cli-runner'
import { GlobalFlags } from '../lib/cli/global-flags'

import vcsProviders from '../mechanics/vcs/providers'
import changelogProviders from '../mechanics/changelog/providers'
import publishProviders from '../mechanics/publish/providers'

export default [
  provide({
    provide: CLI_TOKEN,
    useFactory({ cliExtensions, globalFlags }) {
      return ({ argv }: { argv: string[] }) => runCli(cliExtensions ?? [], globalFlags, argv)
    },
    deps: {
      cliExtensions: { token: CLI_EXTENSION_TOKEN, optional: true, multi: true } as const,
      globalFlags: GLOBAL_FLAGS_TOKEN,
    },
  }),
  provide({
    provide: GLOBAL_FLAGS_TOKEN,
    useClass: GlobalFlags,
  }),
  ...vcsProviders,
  ...changelogProviders,
  ...publishProviders,
]
