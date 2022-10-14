import { createToken, declarePlugin, provide } from '@pvm/di'
import { CLI_EXTENSION_TOKEN, CLI_TOKEN } from '@pvm/tokens-core'
import * as lintCommand from './commands/pvm-lint'
import * as notesCommand from './commands/pvm-notes'
import * as markPrCommand from './commands/pvm-mark-pr'
import * as packagesCommand from './commands/pvm-packages'
import * as publishCommand from './commands/pvm-publish'
import * as rewriteNotesCommand from './commands/pvm-rewrite-notes'
import * as rewriteSetVersions from './commands/pvm-set-versions'
import * as showCommand from './commands/pvm-show'
import * as syncTagCommand from './commands/pvm-sync-tag'
import * as toJsonCommand from './commands/pvm-tojson'
import * as upconfCommand from './commands/pvm-upconf'
import * as writeVersionsCommand from './commands/pvm-write-versions'
import { runCli } from './cli-runner'
import { publish } from './publish/index'
import { getPackages } from './packages'

export const PUBLISH_API_TOKEN = createToken<typeof publish>('PUBLISH_TOKEN')
export const GET_PACKAGE_API_TOKEN = createToken<typeof getPackages>('GET_PACKAGES_TOKEN')

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
        provide({
          provide: CLI_EXTENSION_TOKEN,
          useValue: [
            lintCommand,
            markPrCommand,
            notesCommand,
            packagesCommand,
            publishCommand,
            rewriteNotesCommand,
            rewriteSetVersions,
            showCommand,
            syncTagCommand,
            toJsonCommand,
            upconfCommand,
            writeVersionsCommand,
          ],
          multi: true,
        }),
        provide({
          provide: GET_PACKAGE_API_TOKEN,
          useValue: getPackages,
        }),
        provide({
          provide: PUBLISH_API_TOKEN,
          useValue: publish,
        }),
      ],
    }
  },
})
