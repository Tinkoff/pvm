import { declarePlugin, provide } from '../lib/di'
import { CLI_EXTENSION_TOKEN, DI_TOKEN } from '../tokens'
import addTagCommand from './pvm-add-tag'
import artifactsCommand from './artifacts/pvm-artifacts'
import changelogCommand from './changelog/pvm-changelog'
import filesCommand from './pvm-files'
import notificationsCommand from './notifications/pvm-notification'
import pkgsetCommand from './pvm-pkgset'
import releasesCommand from './releases/pvm-releases'
import updateCommand from './update/pvm-update'
import vcsCommand from './pvm-vcs'
import vizCommand from './pvm-viz'
import lintCommand from './pvm-lint'
import markPrCommand from './pvm-mark-pr'
import notesCommand from './pvm-notes'
import packagesCommand from './pvm-packages'
import publishCommand from './pvm-publish'
import rewriteNotesCommand from './pvm-rewrite-notes'
import rewriteSetVersions from './pvm-set-versions'
import showCommand from './pvm-show'
import writeVersionsCommand from './pvm-write-versions'

export default declarePlugin({
  factory: function() {
    return {
      providers: [
        provide({
          provide: CLI_EXTENSION_TOKEN,
          useFactory: ({ di }) => [
            addTagCommand(di),
            artifactsCommand(di),
            changelogCommand(di),
            filesCommand(di),
            notificationsCommand(di),
            pkgsetCommand(di),
            releasesCommand(di),
            updateCommand(di),
            vcsCommand(di),
            vizCommand(),
            lintCommand(di),
            markPrCommand(di),
            notesCommand(di),
            packagesCommand(di),
            publishCommand(di),
            rewriteNotesCommand(di),
            rewriteSetVersions(di),
            showCommand(di),
            writeVersionsCommand(di),
          ],
          multi: true,
          deps: {
            di: DI_TOKEN,
          },
        }),
      ],
    }
  },
})
