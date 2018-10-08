import type { ChangedFilesOpts } from '../changed-files'
import { changedFiles } from '../changed-files'
import type { FromChangedFilesOpts } from '../from-changed-files'
import { pkgsetFromChangedFiles } from '../from-changed-files'
import type { Pkg } from '@pvm/core/lib/pkg'
import { describeStrategy } from '../utils/describe-strategy'
import { getConfig } from '@pvm/core/lib/config'
import chalk from 'chalk'

export type PkgsetChangedOpts = ChangedFilesOpts & FromChangedFilesOpts

async function * pkgset(opts: PkgsetChangedOpts = {}): AsyncIterableIterator<Pkg> {
  const config = await getConfig(opts.cwd)
  yield * pkgsetFromChangedFiles(config, changedFiles(opts), opts)
}

describeStrategy(pkgset, 'changed', chalk`Prints packages which have been changed between two revisions.

    Options:
      {yellow from}: revision from. Default is origin/master.
      {yellow to}: revision to. Default is HEAD.
      {yellow include-root}: include root packages ? By default include if root package has version field, otherwise not.
      {yellow include-uncommited}: track uncommited changes too ? Default is false`)

export default pkgset
