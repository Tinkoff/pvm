import fs from 'fs'
import { mkdirp } from '../../lib/fs'
import path from 'path'
import frontMatter from 'front-matter'
import { loggerFor } from '../../lib/logger'

import pkgsetAll from '../pkgset/strategies/all'
import { lazyCompileTemplate } from '../template'
import { pkgChangelogPath } from './rules'
import { releaseDataMaker } from '../releases/release-data'
import { wdmemoize, CacheTag } from '../../lib/memoize'
import { prevReleaseTag } from '../../lib/git/last-release-tag'
import { wdShell } from '../../lib/shell'

import type { Pkg } from '../../lib/pkg'
import type { ReleaseContext } from '../update/types'
import type { Config } from '../../types'
import type { Renderer, IncrementalRenderer } from './types'
import type { ReleaseData } from '../releases/types'
import { cwdToGitRelativity } from '../../lib/git/worktree'
import type { Container } from '../../lib/di'
import { CHANGELOG_RENDERERS_MAP, CONFIG_TOKEN } from '../../tokens'

const logger = loggerFor('pvm:changelog')

export enum RenderTarget {
  changelog,
  markPr,
}

export async function getRendererPure(di: Container, rendererTarget: RenderTarget = RenderTarget.changelog): Promise<Renderer | IncrementalRenderer> {
  const config = di.get(CONFIG_TOKEN)
  const renderersMap = di.get(CHANGELOG_RENDERERS_MAP)

  const { renderer } = rendererTarget === RenderTarget.changelog ? config.changelog : config.mark_pr

  const rendererInstance = renderersMap[renderer.type]

  if (!rendererInstance) {
    throw new Error(`Changelog renderer should be defined`)
  }

  return rendererInstance
}

export const getRenderer = wdmemoize(getRendererPure, [CacheTag.pvmConfig])

export interface ChangelogContents {
  body: string,
  attributes: Record<string, any>,
  frontmatter?: string,
}

function renderContents(contents: ChangelogContents): string {
  let fm = ''
  if (contents.frontmatter) {
    fm = `---\n${contents.frontmatter}\n---\n\n`
  }
  return `${fm}${contents.body}`
}

function readChangelog(changelogPath: string): ChangelogContents {
  let content = ''

  if (fs.existsSync(changelogPath)) {
    content = fs.readFileSync(changelogPath, {
      encoding: 'utf8',
    })
  }
  return frontMatter(content)
}

export async function renderReleaseContext(di: Container, releaseContext: ReleaseContext, renderTarget: RenderTarget, forPkg: Pkg | void = void 0): Promise<string> {
  const renderer = await getRenderer(di, renderTarget)
  const releaseData = await releaseDataMaker.fromReleaseContext(releaseContext)

  return renderer.render(releaseData ? [releaseData] : [], forPkg?.name)
}

async function getReleasesRenderer(di: Container, releaseData?: ReleaseData): Promise<(contents: ChangelogContents, forPkg?: Pkg) => Promise<string>> {
  const config = di.get(CONFIG_TOKEN)
  return async (contents: ChangelogContents, forPkg: Pkg | undefined = void 0): Promise<string> => {
    const renderer = await getRenderer(di)
    const conf = forPkg ? config.changelog.for_packages : config.changelog
    const isIncremental = 'append' in renderer

    // Используем ReleaseList при условии
    // для пакета: если он не новый и (нет контента или рендерер не инкрементальный)
    // не для пакета: нет контента или рендерер не инкрементальный
    // Если ReleaseList.enabled не включен и он нужен то ченжлог генерируется только на основе ReleaseData
    let needToRenderReleaseList = !contents.body || !isIncremental

    if (forPkg && isPkgNew(config, forPkg)) {
      logger.info(`Package "${forPkg.name}" is new, render only current release for them`)
      needToRenderReleaseList = false
    }

    const releaseListAvailable = config.release_list.enabled && fs.existsSync(config.release_list.path)
    if (!isIncremental && !releaseListAvailable) {
      logger.warn(
        `It is not possible to maintain the release history in the changelog.`,
        `Either enable "ReleaseList" feature via "release_list.enanled" or use incremental changelog renderer`
      )
    }

    if (needToRenderReleaseList && !releaseListAvailable) {
      needToRenderReleaseList = false
      if (releaseData) {
        logger.warn(`Unable to render ReleaseList, it's not available. Render only current release.`)
      } else {
        logger.warn(`NOOP. ReleaseList is not ebabled or doesn't generated yet (Forgot to run "pvm releases make" ?).`)
      }
    }

    if ((needToRenderReleaseList || !contents.frontmatter) && conf.front_matter) {
      const template = await lazyCompileTemplate(di, conf.front_matter)
      contents.frontmatter = template.render({
        pkg: forPkg,
      })
    }

    if (needToRenderReleaseList) {
      logger.info('Render ReleaseList artifact.')
      const releaseList = JSON.parse(fs.readFileSync(config.release_list.path).toString('utf-8'))
      contents.body = renderer.render(releaseList, forPkg?.name)
    } else if (releaseData && (!conf.skip_empty || releaseData.description)) {
      if (isIncremental) {
        logger.info('Append ReleaseData artifact to changelog.')
        contents.body = (renderer as IncrementalRenderer).append(contents.body, releaseData, forPkg?.name)
      } else {
        logger.warn('Render single ReleaseData artifact to whole changelog.')
        contents.body = renderer.render([releaseData], forPkg?.name)
      }
    } else {
      const changelogName = forPkg ? `"${forPkg.name}'s"` : 'main'
      logger.info(`Keep ${changelogName} changelog as is.`)
    }

    return renderContents(contents)
  }
}

function isPkgNew(config: Config, pkg: Pkg): boolean {
  const compareFrom = prevReleaseTag(config, 'HEAD')
  if (!compareFrom) {
    return true
  }

  try {
    wdShell(config.cwd, `git show ${compareFrom}:${cwdToGitRelativity(config.cwd, pkg.path)}/package.json`)
  } catch (e) {
    return true
  }

  return false
}

async function mainChangelog(di: Container, releaseData?: ReleaseData): Promise<string> {
  const renderReleases = await getReleasesRenderer(di, releaseData)
  const config = di.get(CONFIG_TOKEN)

  const contents = readChangelog(path.join(config.cwd, config.changelog.path))

  return renderReleases(contents)
}

async function packagesChangelog(di: Container, releaseData?: ReleaseData): Promise<void> {
  const pkgsetOpts = {
    includeRoot: false,
  }

  const renderReleases = await getReleasesRenderer(di, releaseData)

  for await (const pkg of pkgsetAll(di, pkgsetOpts)) {
    logger.debug(`update changelog for ${pkg.name}`)

    const config = di.get(CONFIG_TOKEN)
    const changelogAbsPath = pkgChangelogPath(config, pkg)

    const contents = readChangelog(changelogAbsPath)

    mkdirp(path.dirname(changelogAbsPath))
    const result = await renderReleases(contents, pkg)
    if (!config.executionContext.dryRun) {
      fs.writeFileSync(changelogAbsPath, result)
    }
  }
}

async function makeChangelog(di: Container, releaseData?: ReleaseData): Promise<void> {
  const config = di.get(CONFIG_TOKEN)
  const conf = config.changelog
  mkdirp(path.dirname(conf.path))
  const result = await mainChangelog(di, releaseData)
  if (!config.executionContext.dryRun) {
    fs.writeFileSync(conf.path, result)
  }

  if (conf.for_packages.enabled) {
    await packagesChangelog(di, releaseData)
  }
}

export {
  mainChangelog,
  makeChangelog,
}
