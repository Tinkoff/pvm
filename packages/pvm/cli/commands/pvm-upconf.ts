#!/usr/bin/env node
import initVcs from '@pvm/vcs'
import { upconf } from '@pvm/repository/lib/upconf/upconf'
import { prepare } from '@pvm/repository/lib/upconf/prepare'
import type { Argv } from 'yargs'

export const command = 'upconf'
export const description = 'Commands for preparing and perfoming configuration migration for pvm'
export const builder = (yargs: Argv) => {
  return yargs
    .demandCommand()
    .command('migrate', 'Perform migration to new config based on pvm-upconf.json file', {}, migrate)
    .command(
      'prepare',
      'Prepare working dir for configuration migration process. Run this command right after changing pvm configuration',
      {},
      doPrepare
    )
}
export const handler = function() {}

async function doPrepare() {
  return prepare(process.cwd())
}

async function migrate() {
  const vcs = await initVcs({
    vcsType: 'git',
    localMode: true,
  })

  await upconf(vcs)
}
