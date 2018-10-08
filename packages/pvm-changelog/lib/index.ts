import fs from 'fs'
import path from 'path'
import frontMatter from 'front-matter'
import resolveFrom from 'resolve-from'
import { requireDefault } from '@pvm/core/lib'
import { loggerFor } from '@pvm/core/lib/logger'
import { getConfig } from '@pvm/core/lib/config'
import { getHostApi } from '@pvm/core/lib/plugins'
import { mkdirp } from '@pvm/core/lib/fs'
import pkgsetAll from '@pvm/pkgset/lib/strategies/all'
import { lazyCompileTemplate } from '@pvm/template/lib'
import provideBuiltinRenderers from './provide-builtin-renderers'
import { pkgChangelogPath } from './rules'
import { releaseDataMaker } from '@pvm/releases/lib/release-data'
import { wdmemoize, CacheTag } from '@pvm/core/lib/memoize'
import { prevReleaseTag } from '@pvm/core/lib/git/last-release-tag'
import { wdShell } from '@pvm/core/lib/shell'

import type { Pkg } from '@pvm/core/lib/pkg'
import type { ReleaseContext } from '@pvm/update/types'
import type { Config } from '@pvm/core/lib/config'
import type { Renderer, IncrementalRenderer } from '../types'
import type { ReleaseData } from '@pvm/releases/types'

const logger = loggerFor('pvm:changelog')

export enum RenderTarget {
  changelog,
  markPr,
}

export async function getRendererPure(cwd: string, rendererTarget: RenderTarget = RenderTarget.changelog): Promise<Renderer | IncrementalRenderer> {
  const config = await getConfig(cwd)
  await provideBuiltinRenderers(config.cwd)

  const { renderer } = rendererTarget === RenderTarget.changelog ? config.changelog : config.mark_pr
  const hostApi = await getHostApi(config.cwd)

  let RendererClass: new() => Renderer | IncrementalRenderer

  switch (renderer.type) {
    case 'builtin.list':
    case 'builtin.list-with-packages':
      RendererClass = hostApi.getOr(`changelog.${renderer.type}`, null)
      break
    case 'commonjs': {
      const filePath = resolveFrom(config.cwd, renderer.path)
      RendererClass = requireDefault(filePath)
      if (!RendererClass) {
        throw new Error(`Renderer not found at ${renderer.path}, check your pvm settings.`)
      }
      break
    }
    case 'by-plugin': {
      if (!renderer.providesPath.startsWith('changelog.')) {
        throw new Error(`renderer.providesPath for type "by-plugin" should starts with "changelog." but got "${renderer.providesPath}" instead.`)
      }
      RendererClass = hostApi.getOr(renderer.providesPath, null)
      if (!RendererClass) {
        throw new Error(`There are no plugins who provides "${renderer.providesPath}" entry.`)
      }
      break
    }
  }

  if (typeof RendererClass !== 'function') {
    throw new Error(`Changelog renderer should be class, but got ${typeof RendererClass}. config.changelog.renderer.type is "${config.changelog.renderer.type}"`)
  }

  return new RendererClass()
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

export async function renderReleaseContext(releaseContext: ReleaseContext, renderTarget: RenderTarget, forPkg: Pkg | void = void 0): Promise<string> {
  const { cwd } = releaseContext.updateState.repo
  const renderer = await getRenderer(cwd, renderTarget)
  const releaseData = await releaseDataMaker.fromReleaseContext(releaseContext)

  return renderer.render(releaseData ? [releaseData] : [], forPkg?.name)
}

async function getReleasesRenderer(config: Config, releaseData?: ReleaseData): Promise<(contents: ChangelogContents, forPkg?: Pkg) => Promise<string>> {
  return async (contents: ChangelogContents, forPkg: Pkg | undefined = void 0): Promise<string> => {
    const renderer = await getRenderer(config.cwd)
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
      const template = await lazyCompileTemplate(conf.front_matter)
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
    wdShell(config.cwd, `git show ${compareFrom}:${pkg.path}/package.json`)
  } catch (e) {
    return true
  }

  return false
}

async function mainChangelog(config: Config, releaseData?: ReleaseData): Promise<string> {
  const renderReleases = await getReleasesRenderer(config, releaseData)

  const contents = readChangelog(path.join(config.cwd, config.changelog.path))

  return renderReleases(contents)
}

async function packagesChangelog(config: Config, releaseData?: ReleaseData): Promise<void> {
  const pkgsetOpts = {
    includeRoot: false,
  }

  const renderReleases = await getReleasesRenderer(config, releaseData)

  for await (const pkg of pkgsetAll(pkgsetOpts)) {
    logger.debug(`update changelog for ${pkg.name}`)

    const changelogAbsPath = pkgChangelogPath(config, pkg)

    const contents = readChangelog(changelogAbsPath)

    mkdirp(path.dirname(changelogAbsPath))
    const result = await renderReleases(contents, pkg)
    if (!config.executionContext.dryRun) {
      fs.writeFileSync(changelogAbsPath, result)
    }
  }
}

async function makeChangelog(config: Config, releaseData?: ReleaseData): Promise<void> {
  const conf = config.changelog
  mkdirp(path.dirname(conf.path))
  const result = await mainChangelog(config, releaseData)
  if (!config.executionContext.dryRun) {
    fs.writeFileSync(conf.path, result)
  }

  if (conf.for_packages.enabled) {
    await packagesChangelog(config, releaseData)
  }
}

export {
  mainChangelog,
  makeChangelog,
}
