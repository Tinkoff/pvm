#!/usr/bin/env node
import chalk from 'chalk'
// eslint-disable-next-line node/no-extraneous-import
import { parseSubArgs } from '../../lib/text/sub-args'
import {
  updateMethods,
} from '../../mechanics/update/update-methods/index'
import { update } from '../../mechanics/update/index'
import type { CliUpdateOpts } from '../../mechanics/update/types'
import type { Container } from '../../lib/di'
import { GLOBAL_FLAGS_TOKEN } from '../../tokens'
import type { CommandFactory } from '../../types/cli'

function toCamelCase(str: string): string {
  return str.replace(/-[a-z]/g, m => m.charAt(1).toUpperCase())
}

async function printResult(result: AsyncIterable<string> | Iterable<string> | string): Promise<void> {
  if (typeof result === 'string') {
    console.log(result)
  } else if (Symbol.asyncIterator in result) {
    for await (const line of result) {
      console.log(line)
    }
  } else if (Symbol.iterator in result) {
    // @ts-ignore
    for (const line of result) {
      console.log(line)
    }
  }
}

export default (di: Container): CommandFactory => (yargs) => yargs.command(
  ['update', 'relase'],
  'Update packages changed since last release',
  (yargs) => {
    return yargs
      .options({
        'update-option': {
          default: [],
          type: 'array' as const,
          alias: 'P',
          description: `Options to the used update method`,
          coerce(arg: string[]) {
            return parseSubArgs(arg)
          },
        },
        'update-method': {
          alias: 'p',
          default: 'release',
          type: 'string' as const,
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
  async function run(flags): Promise<void> {
    const updateMethodName = toCamelCase(flags['update-method'])
    const updateMethod = updateMethods[updateMethodName]
    if (!updateMethod) {
      throw new Error(`There is no "${flags['update-method']}" update method`)
    }

    const globalFlags = di.get(GLOBAL_FLAGS_TOKEN)
    const dryRun = globalFlags.getFlag('dryRun')
    const local = globalFlags.getFlag('localMode')

    const updateOpts: CliUpdateOpts = {
      ...flags['update-option'] as Record<string, string>,
      dryRun,
      local,
      releaseDataFile: flags['release-data-file'],
      tagOnly: flags['tag-only'],
    }

    const result = await update(di, updateMethod, updateOpts)
    if (result) {
      // @ts-ignore
      await printResult(result)
    }
  }
)
