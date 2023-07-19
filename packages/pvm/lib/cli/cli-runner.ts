#!/usr/bin/env node
import assert from 'assert'
import Yargs from 'yargs/yargs'
// @ts-ignore
import { hideBin } from 'yargs/helpers'

import '../node-boot'

import type { Argv } from 'yargs'
import type { CLI_EXTENSION_TOKEN } from '../../tokens'
import type { GlobalFlags } from './global-flags'
import type { ExtractTokenType } from '../../lib/di'

function initCommands(yargs: Argv, commandBuilders: ExtractTokenType<typeof CLI_EXTENSION_TOKEN>[]) {
  commandBuilders.forEach(builder => {
    if (Array.isArray(builder)) {
      builder.forEach(b => b(yargs))
    } else {
      builder(yargs)
    }
  })

  return yargs
}

export function runCli(commands: Array<typeof CLI_EXTENSION_TOKEN>, globalFlags: GlobalFlags, argv: string[]) {
  if (Yargs(argv).argv.dryRun) {
    globalFlags.setFlag('dryRun', true)
  }
  const yargs = initCommands(Yargs(hideBin(argv)), commands)
    .command('help <subcommand>', 'Get help for subcommand', {}, (argv) => {
      initCommands(Yargs([(argv as Record<string, string>).subcommand, '--help']), commands)
        .wrap(120)
        .showHelp('info')
    })
    .demandCommand()
    .strict()
    .wrap(100)
    .fail((msg, err, _usage) => {
      // @ts-ignore
      const validation = yargs.getValidationInstance()
      // @ts-ignore
      const usage = yargs.getUsageInstance()
      let exitCode = 1

      if (msg && !err) {
        const usageFail = usage.fail
        try {
          usage.fail = () => {}
          if (validation.unknownCommands(yargs.argv)) {
            // 127 - “command not found”
            exitCode = 127
          }
        } finally {
          usage.fail = usageFail
        }
      }

      console.error(err ? err.stack || err : msg)
      process.exitCode = exitCode
    })
    .onFinishCommand(() => {
      if (typeof process.exitCode === 'undefined') {
        // если exitCode уже не выставлен явно ставим exitCode чтобы отследить возможный deadlock в node-boot.ts
        process.exitCode = 0
      }
    })
    .help()

  patchYargsOptions(yargs).parse()
}

function hasExplicitType(opt: { boolean?: boolean, number?: boolean, string?: boolean, array?: boolean, type?: string }): boolean {
  return opt.boolean || opt.number || opt.string || opt.array || !!opt.type
}

function guessType(value: any): 'boolean' | 'number' | 'array' | 'string' | undefined {
  if (Array.isArray(value)) {
    return 'array' as const
  }
  const nativeType = typeof value

  if (nativeType === 'number' || nativeType === 'boolean' || nativeType === 'string') {
    return nativeType
  }
}

function patchYargsOptions(yargs: Argv, runSelfTest = true): Argv {
  assert.strictEqual(yargs.options, yargs.option)
  const originalOption = yargs.option
  // @ts-ignore
  yargs.options = yargs.option = (key, opt) => {
    if (typeof key === 'object') {
      return originalOption.call(yargs, key)
    } else {
      if (('default' in opt) && !hasExplicitType(opt)) {
        const derivedType = guessType(opt.default)
        if (derivedType) {
          opt.type = derivedType
        }
      }
      // @ts-ignore
      return originalOption.call(yargs, key, opt)
    }
  }

  if (runSelfTest) {
    const result = patchYargsOptions(Yargs()
      .command('foo', 'foo command desc', {
        boo: {
          desc: 'should be true if passed without value',
          default: false,
        },
      }), false)
      .parse('foo --boo')

    assert.strictEqual(result.boo, true, `pvm::patchYargsOptions doesn't work! check yargs version which pvm requires.`)
  }

  return yargs
}