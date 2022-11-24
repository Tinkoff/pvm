#!/usr/bin/env node
import pprint from '../mechanics/pkgset/pprint'
import { getPackages } from '../mechanics/packages'
import type { Container } from '../lib/di'

async function * iterateFromPromise<T>(willBeList: Promise<Array<T>>): AsyncIterable<T> {
  const list = await willBeList
  for (const item of list) {
    yield item
  }
}

export default (di: Container) => ({
  command: 'packages',
  description: 'Shows the list of packages by the specified criterion',
  builder: {
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
      // connected with type PackagesType in ../../lib/packages.ts
      choices: ['about-to-update', 'update', 'changed', 'changed-since-release', 'affected', 'released', 'updated', 'all'],
      default: 'all',
    },
    filter: {
      desc: `filter output by "packages filter". You can filter by package names, or by package paths starting filter with "/" symbol.`,
      type: 'array' as const,
      default: [],
    },
  },
  handler: async function main(flags) {
    for await (const line of pprint(iterateFromPromise(getPackages(di, flags.list, { filter: flags.filter })), flags.format)) {
      console.log(line)
    }
  },
})
