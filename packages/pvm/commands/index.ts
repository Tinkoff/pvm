import { declarePlugin, provide } from '../lib/di'
import { CLI_EXTENSION_TOKEN } from '../tokens'
import * as addTagCommand from './pvm-add-tag'
import * as artifactsCommand from './artifacts/pvm-artifacts'
import * as changelogCommand from './changelog/pvm-changelog'
import * as filesCommand from './pvm-files'
import * as notificationsCommand from './notifications/pvm-notification'
import * as pkgsetCommand from './pvm-pkgset'
import * as releasesCommand from './releases/pvm-releases'
import * as updateCommand from './update/pvm-update'
import * as vcsCommand from './pvm-vcs'
import * as vizCommand from './pvm-viz'
import * as lintCommand from './pvm-lint'
import * as markPrCommand from './pvm-mark-pr'
import * as notesCommand from './pvm-notes'
import * as packagesCommand from './pvm-packages'
import * as publishCommand from './pvm-publish'
import * as rewriteNotesCommand from './pvm-rewrite-notes'
import * as rewriteSetVersions from './pvm-set-versions'
import * as showCommand from './pvm-show'
import * as syncTagCommand from './pvm-sync-tag'
import * as toJsonCommand from './pvm-tojson'
import * as writeVersionsCommand from './pvm-write-versions'

export default declarePlugin({
  factory: function() {
    return {
      providers: [
        provide({
          provide: CLI_EXTENSION_TOKEN,
          useValue: [
            addTagCommand,
            artifactsCommand,
            changelogCommand,
            filesCommand,
            notificationsCommand,
            pkgsetCommand,
            releasesCommand,
            updateCommand,
            vcsCommand,
            vizCommand,
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
            writeVersionsCommand,
          ],
          multi: true,
        }),
      ],
    }
  },
})
