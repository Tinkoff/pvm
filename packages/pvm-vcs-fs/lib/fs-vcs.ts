import fs from 'fs'
import path from 'path'
import { wdShell } from '@pvm/core/lib/shell'
import { mkdirp } from '@pvm/core/lib/fs'
import { loggerFor } from '@pvm/core/lib/logger'
import { mema } from '@pvm/core/lib/memoize'

import type { AbstractVcs } from '@pvm/vcs/types'
import { gitFetch } from '@pvm/core/lib/git/commands'

const log = loggerFor('pvm:fs-vcs')

function makeFsVcs(cwd: string): AbstractVcs<void> {
  const rp = (filePath: string): string => path.resolve(cwd, filePath)

  const fsVcs: AbstractVcs<void> = {
    beginCommit(): void {},
    rollbackCommit(_: void): Promise<void> {
      return Promise.resolve()
    },
    addFiles(_context, _fp) {
      // noop
    },
    async appendFile(_, filePath: string, content: string) {
      mkdirp(path.dirname(rp(filePath)))
      fs.appendFileSync(rp(filePath), content)
    },
    async updateFile(_, filePath, content) {
      mkdirp(path.dirname(rp(filePath)))
      fs.writeFileSync(rp(filePath), content)
    },
    getCurrentBranch(): string | void {
      // noop
    },
    async deleteFile(_, filePath) {
      if (fs.existsSync(rp(filePath))) {
        fs.unlinkSync(rp(filePath))
      }
    },
    async fetchLatestSha(refName): Promise<string> {
      gitFetch(cwd, { repo: 'origin' })

      return wdShell(cwd, `git rev-parse origin/${refName}`)
    },

    async commit() {
      return { id: 'fake commit' }
    },
    async addTag(...args) {
      log.debug('NOOP: Add tag', ...args)
    },
    async push() {
      log.debug('NOOP: Push')
    },
    dryRun() {
      log.debug('NOOP: dry run')
    },
    isLastAvailableRef(): boolean {
      // log.info('NOOP: isLastAvailableRev')
      return false
    },
    getHeadRev() {
      return '0000000000000000000000000000000000000000'
    },
  }

  return fsVcs
}

export const initFsVcs = mema(makeFsVcs)
