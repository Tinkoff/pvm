import now from '@pvm/core/lib/now'

export interface TableBuilderOpts {
  locale: string,
  currentYear: number,
}

interface TableRow {
  data: [string, string],
  date: Date,
  sameFollowingDates: number,
  sameDate: boolean,
  slug: string,
}

class TableBuilder {
  private readonly rows: TableRow[]
  private readonly opts: Partial<TableBuilderOpts>
  private lastUniqDayOfMonth: number

  public constructor(opts: Partial<TableBuilderOpts> = {}) {
    this.opts = opts
    this.rows = []
    this.lastUniqDayOfMonth = 0
  }

  public addRow(date: Date, slug: string, [link, desc]: [string, string]) {
    const row: TableRow = {
      date,
      slug,
      data: [link, desc],
      sameFollowingDates: 0,
      sameDate: false,
    }

    if (this.lastUniqDayOfMonth !== this.rows.length) {
      const uniqRow = this.rows[this.lastUniqDayOfMonth]
      if (row.date.getDate() === uniqRow.date.getDate() && row.date.getMonth() === uniqRow.date.getMonth()) {
        row.sameDate = true
        uniqRow.sameFollowingDates++
      } else {
        this.lastUniqDayOfMonth = this.rows.length
      }
    }

    this.rows.push(row)
  }

  public build(): string {
    const {
      locale = 'en-us',
      currentYear = now().getFullYear(),
    } = this.opts

    const changelog: string[] = []
    let lastMonth: string | null = null
    let lastYear: number | null = null

    const startTable = `<table>
    <thead>
     <tr>
      <th>Day</th>
      <th>Version</th>
      <th style="text-align: left">Description</th>
     </tr>
   </thead>
   <tbody>
  `

    const endTable = `</tbody></table>`
    let tableStarted = false

    for (const row of this.rows) {
      const { date, data } = row

      const month = date.toLocaleString(locale, { month: 'long' })
      const year = date.getFullYear()

      if (year !== lastYear && year !== currentYear) {
        if (tableStarted) {
          tableStarted = false
          changelog.push(endTable)
        }
        changelog.push(`\n# ${year}\n`)
      }

      if (month !== lastMonth) {
        if (tableStarted) {
          tableStarted = false
          changelog.push(endTable)
        }
        changelog.push(`\n## ${month}\n`)
        changelog.push(startTable)
        tableStarted = true
      }

      lastYear = year
      lastMonth = month

      const [link, desc] = data

      changelog.push(`<tr>`)
      if (!row.sameDate) {
        const monthDay = date.getDate()

        const dateLink = `
          <a class="anchor" aria-hidden="true" id="${row.slug}"></a>
          <a href="#${row.slug}">${monthDay}</a>
        `

        changelog.push(`<td rowspan="${row.sameFollowingDates + 1}">${dateLink}</td>`)
      }
      changelog.push(`<td>${link}</td>`)
      changelog.push(`<td style="text-align: left">${desc}</td>`)
      changelog.push(`</tr>`)
    }

    if (tableStarted) {
      changelog.push(endTable)
    }

    return changelog.join('\n')
  }
}

export default TableBuilder
