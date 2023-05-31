import CliTable from 'cli-table'
import chalk from 'chalk'

import type { Pkg } from '../pkg'

export interface ColumnsProvider<T> {
  [key: string]: (item: T) => string,
}

export function pprintPackages(packages: Iterable<Pkg>, columnsProvider: ColumnsProvider<Pkg>): void {
  const header = ['package'].concat(Object.keys(columnsProvider))
  const rows = Array.from(packages).map((pkg) => {
    return [chalk`{blue.bold ${pkg.name}}`].concat(Object.keys(columnsProvider).map(key => {
      return columnsProvider[key](pkg)
    }))
  })

  const table = new CliTable({
    head: header,
  })

  table.push(...rows)
  console.error(table.toString())
}
