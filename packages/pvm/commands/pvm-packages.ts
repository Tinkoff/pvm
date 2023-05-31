import pprint from '../mechanics/pkgset/pprint'
import type { PackagesType } from '../mechanics/packages'
import { getPackages } from '../mechanics/packages'
import type { Container } from '../lib/di'
import type { CommandFactory } from '../types'

async function * iterateFromPromise<T>(willBeList: Promise<Array<T>>): AsyncIterable<T> {
  const list = await willBeList
  for (const item of list) {
    yield item
  }
}

export default (di: Container): CommandFactory => builder => {
  const packageTypes: PackagesType[] = ['about-to-update', 'update', 'changed', 'changed-since-release', 'affected', 'released', 'updated', 'all']
  return builder.command(
    'packages',
    'Shows the list of packages by the specified criterion',
    {
      format: {
        desc: `Pretty-print the package information in a given format. Format is string, with special symbols:
          %p - path to package
          %n - package name
          %s - package name without namespace if it's present
          %v - package version`,
        default: '%p',
      },
      list: {
        desc: 'kind of packages to show',
        choices: packageTypes,
        default: 'all',
      },
      filter: {
        desc: `filter output by "packages filter". You can filter by package names, or by package paths starting filter with "/" symbol.`,
        type: 'array' as const,
        default: [],
      },
    },
    async function main(flags) {
      for await (const line of pprint(iterateFromPromise(getPackages(di, flags.list as PackagesType, { filter: flags.filter })), flags.format)) {
        console.log(line)
      }
    }
  )
}
