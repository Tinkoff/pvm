#!/usr/bin/env node
import chalk from 'chalk'
// eslint-disable-next-line node/no-extraneous-import
import type Yargs from 'yargs'
import { parseSubArgs } from '../../lib/text/sub-args'
import * as updateMethods from '../../mechanics/update/update-methods/index'
import { update } from '../../mechanics/update/index'
import type { CliUpdateOpts } from '../../mechanics/update/types'
import type { Container } from '../../lib/di'
import { CONFIG_TOKEN } from '../../tokens'

function toCamelCase(str: string): string {
  return str.replace(/-[a-z]/g, m => m.charAt(1).toUpperCase())
}

async function printResult(result: AsyncIterable<string> | Iterable<string> | string): Promise<void> {
  if (typeof result === 'string') {
    console.log(result)
  } else if (result[Symbol.asyncIterator]) {
    for await (const line of result) {
      console.log(line)
    }
  } else if (result[Symbol.iterator]) {
    // @ts-ignore
    for (const line of result) {
      console.log(line)
    }
  }
}

export default (di: Container) => ({
  command: 'update',
  aliases: 'release',
  description: 'Update packages changed since last release',
  builder: (yargs: Yargs.Argv) => {
    return yargs
      .options({
        'update-option': {
          default: [],
          type: 'array' as const,
          alias: 'P',
          description: `Options to the used update method`,
          coerce(arg) {
            return parseSubArgs(arg)
          },
        },
        'update-method': {
          alias: 'p',
          default: 'release',
          description:
            chalk`What we should do with changed packages. Options are:
{greenBright release}
.  Do release. This is default. Commit new package versions, create release tag and store release notes.
.
.  Options:
.     {yellow local}: Do not push changes to the remote vcs server.
.
{greenBright dot}
.  Generate graph in dot format of changed packages and print it to stdout
.
{greenBright print}
.  Print changed packages
.
.  Options:
.    {yellow format}: String with flags - how we should print each package. For possible flags see help for pvm pkgset command.
.                     Default is "%n".
{greenBright md-table}
.  Print packages about to release as md table.
`,
        },
        'dry-run': {
          description: `Do all the job, but without any side-effect`,
          type: 'boolean' as const,
        },
        'release-data-file': {
          description: `Output release data to specified path`,
          type: 'string' as const,
        },
        'tag-only': {
          description: `Make release tag only, do not do or commit any changes to VCS`,
          type: 'boolean' as const,
        },
      })
      .example(`$0 update -P local`, 'update packages changed since last release, but don\'t push changes')
  },

  handler: async function run(flags): Promise<void> {
    const updateMethodName = toCamelCase(flags.updateMethod)
    const updateMethod = updateMethods[updateMethodName]
    if (!updateMethod) {
      throw new Error(`There is no "${flags.updateMethod}" update method`)
    }

    if (flags.local) {
      flags.P = flags.P || {}
      flags.P.local = true
    }

    const updateOpts: CliUpdateOpts = {
      ...flags.P,
      dryRun: flags.dryRun,
      releaseDataFile: flags.releaseDataFile,
      tagOnly: flags.tagOnly,
    }

    const config = di.get(CONFIG_TOKEN)
    config.executionContext.dryRun = flags.dryRun
    config.executionContext.local = flags.local

    const result = await update(di, updateMethod, updateOpts)
    if (result) {
      // @ts-ignore
      await printResult(result)
    }
  },
})
