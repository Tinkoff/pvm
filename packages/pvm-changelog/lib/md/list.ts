import formatDate from 'date-fns/format'
import indentHeadings from '../indent-headings'
import type { IncrementalRenderer } from '../../types'
import type { ReleaseData } from '@pvm/releases/types'

export interface ListOptions {
  date_format: string,
  tag_head_level: number,
  show_date: boolean,
}

const defaultOptions: ListOptions = {
  tag_head_level: 2,
  date_format: 'yyyy.MM.dd',
  show_date: true,
}

class ListRenderer implements IncrementalRenderer {
  opts: ListOptions

  public constructor(opts: Partial<ListOptions> = {}) {
    this.opts = {
      ...defaultOptions,
      ...opts,
    }
  }

  renderRelease(release: ReleaseData, forPkg: string | undefined): string | null {
    const changelog: string[] = []
    const { opts } = this

    const tagHeading = Buffer.alloc(opts.tag_head_level, '#').toString()
    const createdAt = new Date(release.created_at)

    let heading
    if (forPkg) {
      const pkg = release.packages.find(pkgData => pkgData.name === forPkg)
      if (!pkg) {
        return null
      }
      heading = `v${pkg.version}`
    } else {
      heading = release.title || release.tag_name
    }

    changelog.push(`${tagHeading} ${heading}`)
    if (opts.show_date) {
      changelog.push(`**${formatDate(createdAt, opts.date_format)}**\n`)
    }

    changelog.push(indentHeadings(release.description, opts.tag_head_level))

    return changelog.join('\n')
  }

  render(releases: Iterable<ReleaseData>, forPkg?: string): string {
    return Array.from(releases).reduce((acc, releaseData) => {
      const text = this.renderRelease(releaseData, forPkg)
      if (text) {
        acc.push(text)
      }
      return acc
    }, [] as string[]).join('\n')
  }

  append(changelog: string, release: ReleaseData, forPkg?: string): string {
    const text = this.renderRelease(release, forPkg)
    return text ? `${text}\n${changelog}` : changelog
  }
}

export default ListRenderer
