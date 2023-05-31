import formatDate from 'date-fns/format'
import indentHeadings from '../indent-headings'
import type { IncrementalRenderer } from '../types'
import type { ReleaseData } from '../../releases/types'

export interface ListWithPackagesOptions {
  date_format: string,
  tag_head_level: number,
  show_date: boolean,
  updated_packages_title: string,
}

const defaultOptions: ListWithPackagesOptions = {
  tag_head_level: 2,
  date_format: 'yyyy.MM.dd',
  show_date: true,
  updated_packages_title: 'List of updated packages:',
}

class ListWithPackagesRenderer implements IncrementalRenderer {
  opts: ListWithPackagesOptions

  public constructor(opts: Partial<ListWithPackagesOptions> = {}) {
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
    if ('pkgIdentity' in release) {
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

    if (release.packages.length > 0) {
      if (opts.updated_packages_title) {
        changelog.push(opts.updated_packages_title)
      }
      for (const pkgIdentity of release.packages) {
        changelog.push(`- ${pkgIdentity.name}@${pkgIdentity.version}`)
      }
      changelog.push('')
    }
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

export default ListWithPackagesRenderer
