import { calcGenericTagName, addSuffixToSemverTagName } from '../release-name'
import { semverTag, isGenericTagUsed } from '@pvm/core/lib/tag-meta'
import { takeFirstSync } from '@pvm/core/lib/iter'
import { noPackagesInMugError } from '@pvm/core/lib/behaviors/no-packages-in-mug'

import type { ReleaseContext } from '../../types'
import type { Pkg, AppliedPkg } from '@pvm/core/lib/pkg'
import type { UpdateState } from '../update-state'
import type { Repository } from '@pvm/repository'
import chalk from 'chalk'
import { loggerFor } from '@pvm/core/lib/logger'

const logger = loggerFor('pvm:release-context')

function makeGenericTag(repo: Repository): string {
  return calcGenericTagName(repo.config, repo.rootPkg?.name || 'unknown')
}

export class TagAnnotation {
  title: string
  body: string
  footer: string

  constructor(title: string) {
    this.title = title
    this.body = ''
    this.footer = ''
  }

  setBody(body: string) {
    this.body = body
  }

  setFooter(footer: string) {
    this.footer = footer
  }

  toString() {
    return [this.title, this.body, this.footer].filter(x => !!x).join('\n\n')
  }
}

export interface AnnotatedReleaseTag {
  name: string,
  annotation: TagAnnotation,
}

export async function makeAnnotatedReleaseTag(repo: Repository, applyMap: Map<Pkg, AppliedPkg>): Promise<AnnotatedReleaseTag> {
  const { config } = repo

  let releaseTag

  let annotatePackagesInTag: ReadonlyArray<Pkg> = []

  const tagAnnotation = new TagAnnotation(`${repo.rootPkg?.name || '<Unnamed repository>'} release by pvm`)

  if (repo.isMonorepo) {
    if (isGenericTagUsed(config)) {
      releaseTag = makeGenericTag(repo)
      if (config.versioning.source === 'tag') {
        annotatePackagesInTag = repo.packagesMaybeWithRoot.toArray()
      }
    } else {
      // приоритет выбора пакета или группы пакета для семвер-тега:
      // 1. Пакет заданный настройкой tagging.release_tag_package если она задана
      // 2. если versioning.unified = true берем версию из mainUnifiedGroup
      // 3. если не монорепа, то выбора по сути нет
      // 4. если вообще все пакеты имеют одну версию, берем первый из applyMap, т.к. рут пакет может не учитываться вообще
      // 5. во всех остальных случаях берем первый из applyMap
      // 6. последние три кейса вырождаются в один
      let semverPkg: Pkg | undefined = takeFirstSync(applyMap.keys())
      if (config.tagging.release_tag_package) {
        // гарантии что такой пакет есть делаются на уровне Repository.init метода
        semverPkg = repo.packagesMaybeWithRoot.get(config.tagging.release_tag_package)!
      } else if (config.versioning.unified) {
        semverPkg = takeFirstSync(repo.unifiedGroupsMWR.mainUnifiedGroup)
        if (!semverPkg) {
          // пустая unified группа, не очень хороший кейс
          // нужно либо задать release_tag_package
          // либо сделать главную группу не пустой
          throw noPackagesInMugError()
        }
      }

      if (!semverPkg) {
        throw new Error(`Unable to find package for versioning`)
      }

      const semverAppliedPkg = applyMap.get(semverPkg)
      if (semverAppliedPkg) {
        releaseTag = semverTag(semverAppliedPkg)
      } else {
        releaseTag = addSuffixToSemverTagName(config, repo.rootPkg?.name || 'unknown', semverTag(semverPkg))
      }

      if (config.versioning.source === 'tag') {
        // все пакеты кроме mainUnifiedGroup
        annotatePackagesInTag = repo.packagesMaybeWithRoot.toArray().filter(pkg => !repo.unifiedGroupsMWR.mainUnifiedGroup.has(pkg))
      }
    }
  } else {
    const semverPkg = takeFirstSync(applyMap.values())
    if (!semverPkg) {
      throw new Error(`There is no root package. Create at least root package in order to create release context`)
    }
    releaseTag = semverTag(semverPkg)
  }

  if (annotatePackagesInTag.length) {
    const footer: string[] = []
    footer.push('---')
    footer.push(
      ...annotatePackagesInTag.map(pkg => {
        const targetPkg = applyMap.get(pkg) || pkg
        return `${targetPkg.name}@${targetPkg.version}`
      })
    )
    tagAnnotation.setFooter(footer.join('\n'))
  }

  return {
    name: releaseTag,
    annotation: tagAnnotation,
  }
}

export async function createReleaseContext(updateState: UpdateState): Promise<ReleaseContext | null> {
  const { repo } = updateState

  // если ни один пакет не обновляется, то релиз не нужен
  if (!updateState.getReleasePackages().size) {
    logger.log(chalk`{yellowBright release context will not be created, there are no packages having new version}`)
    return null
  }

  const { name, annotation } = await makeAnnotatedReleaseTag(repo, updateState.getReleasePackages())

  if (updateState.getReleasePackages().size > 1) {
    annotation.setBody(`Changed ${updateState.getReleasePackages().size} packages`)
  }

  const hostApi = await repo.getHostApi()
  const releaseNotes = await hostApi.commitsToNotes(updateState.changedContext.commits)

  logger.log(chalk`release context has been generated, release name will be {underline ${name}}`)

  return {
    updateState,
    name,
    tagAnnotation: annotation.toString(),
    releaseTag: name,
    releaseNotes,
  }
}
