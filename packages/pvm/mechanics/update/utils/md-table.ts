import semver from 'semver'
import { UpdateReasonType } from '../update-state'

import type { Pkg } from "../../../lib/pkg"
import type { UpdateState } from '../update-state'
export interface ColumnBuilder<T> {
  title: string,
  body(t: T): string,
}

export class MdTableBuilder<T> {
  private readonly rows: T[]
  public columns: ColumnBuilder<T>[]

  public footer = ''

  public constructor() {
    this.rows = []
    this.columns = []
  }

  public addRow(row: T) {
    this.rows.push(row)
  }

  public addColumn(title: string, body: ColumnBuilder<T>['body']) {
    this.columns.push({
      title,
      body,
    })
  }

  public build() {
    const titles = this.columns.map((cb: ColumnBuilder<T>): string => cb.title).join(' | ')
    const sep = this.columns.map((cb: ColumnBuilder<T>): string => {
      return Buffer.alloc(cb.title.length, '-').toString('utf8')
    }).join(' | ')

    const result = [
      `| ${titles} |`,
      `| ${sep} |`,
    ]

    for (const row of this.rows) {
      const body = this.columns.map(cb => cb.body(row)).join(' | ')

      result.push(`| ${body} |`)
    }
    if (this.footer) {
      result.push('\n')
      result.push(this.footer)
    }

    return result.join('\n')
  }
}

export interface UpdateTableRow {
  oldPkg: Pkg,
  newPkg: Pkg,
  updateState: UpdateState,
}

export class MdUpdatedTable extends MdTableBuilder<UpdateTableRow> {
  constructor() {
    super()
    this.addColumn('package', ({ newPkg }) => newPkg.name)
    this.addColumn('release type', ({ newPkg, oldPkg }) => {
      let releaseType = 'none'
      try {
        releaseType = semver.diff(oldPkg.version, newPkg.version) || 'none'
      } catch (e) {
        // pass
      }
      if (releaseType === 'major') {
        releaseType = `**${releaseType.toUpperCase()}**`
      }

      return releaseType
    })
    this.addColumn('version', ({ newPkg }) => newPkg.version)
    this.addColumn('reason<sup>⇃</sup>', ({ oldPkg, updateState }) => {
      return updateState.updateReasonMap.get(oldPkg) || UpdateReasonType.unknown
    })

    this.footer = `_reason_: dependant - changed only dependencies, for other types see UpdateReasonType enum`
  }
}
