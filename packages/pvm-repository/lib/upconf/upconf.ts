import fs from 'fs'
import path from 'path'
import assert from 'assert'

import { lastReleaseTag, fetchTags } from '@pvm/core/lib/git/last-release-tag'
import { getConfig } from '@pvm/core/lib/config'
import { loggerFor } from '@pvm/core/lib/logger'
import { loadUpconfFile } from '@pvm/core/lib/config/upconf-data'
import { markUpconfDeleted } from '@pvm/core/lib/config/get-config'

import { upconfToTagVersioning } from './transformers/to-tag-versioning'

import type { AnnotatedReleaseTag } from '@pvm/update/lib/release/release-context'
import type { VcsOnly } from '@pvm/vcs/types'
import { deleteTag } from '@pvm/core/lib/git/commands'

const logger = loggerFor('pvm:upconf')

export interface UpconfOpts {
  dryRun?: boolean,
}

async function upconf(vcs: VcsOnly, opts: UpconfOpts = {}): Promise<void> {
  const upconfData = loadUpconfFile(vcs.cwd)
  if (upconfData === false) {
    return
  }

  const { dryRun = vcs.isDryRun } = opts

  logger.info('pvm-upconf.json file found, start migration', dryRun ? 'in DRY RUN mode' : '')
  const nextConfig = await getConfig(vcs.cwd, { noUpconf: true })
  const prevConfig = await getConfig(vcs.cwd)

  const prevReleaseTag = lastReleaseTag(prevConfig)

  if (!prevReleaseTag) {
    logger.info('There is no previous releases, exiting')
    return
  }
  logger.info(`Previous release tag is ${prevReleaseTag}`)

  // требования к upconf в разрезе создания тега и коммитов:
  // 1. новый тег на пред. релиз должен быть создан как локально, для корректной работы ядра pvm, так и доставлен в origin
  // 2. в случае неудачной доставки тега, upconf должен быть перезапущен, логика upconf в этом плане должна быть идемпонтентна
  // 3. upconf не должен создать новый коммит, вместо этого все изменения должны быть доставлены вместе с релизным коммитом

  let releaseTag: undefined | AnnotatedReleaseTag

  const toTagVersioning = nextConfig.versioning?.source === 'tag' && prevConfig.versioning.source !== 'tag'

  if (toTagVersioning) {
    logger.info(`migrate "versioning.source" from "${prevConfig.versioning.source}" to "tag"`)
    releaseTag = await upconfToTagVersioning(vcs, nextConfig)
  }
  if (releaseTag) {
    logger.info(`New release tag "${releaseTag.name}"`)
    logger.info(`annotation: ${releaseTag.annotation.toString()}`)

    const maybeNewReleaseTag = lastReleaseTag(nextConfig)
    if (prevReleaseTag !== releaseTag.name && maybeNewReleaseTag !== releaseTag.name) {
      await vcs.addTag(releaseTag.name, prevReleaseTag, {
        annotation: releaseTag.annotation.toString(),
      })
      // пушим только таг, и по возможности без пайплайна
      // будет работать только для пушей через vcs
      // для платформы весь пуш это noop
      try {
        await vcs.push({
          refspec: releaseTag.name,
          skipCi: true,
        })
      } catch (e) {
        // мы должны быть идемпотентны, но по хорошму это надо делать через транзакционную модель vcs
        // но она сейчас не умеет откатывать теги, поэтому делаем это вручную
        try {
          deleteTag(vcs.cwd, releaseTag.name)
        } catch (deleteTagError) {
          logger.warn(deleteTagError)
        }
        throw e
      }
    } else {
      logger.info(`For some reason release tag ${releaseTag.name} already exists`)
      logger.info('Try to delete it, or update packages in order to get next release tag')
      logger.info('Exiting..')
      return
    }
  }

  if (toTagVersioning && prevConfig.versioning.source === 'file') {
    if (fs.existsSync(path.join(vcs.cwd, prevConfig.versioning.source_file))) {
      await vcs.deleteFile(prevConfig.versioning.source_file)
    }
  }

  logger.info(`Deleting pvm-upconf.json..`)
  await vcs.deleteFile('pvm-upconf.json')

  // sync pushed tags with local one
  // we need it for pvm-core commands which works with local working tree
  logger.info('Sync remote tags with local working tree..')
  await fetchTags(vcs.cwd)

  if (!dryRun) {
    logger.info('Updating current config..')
    markUpconfDeleted(vcs.cwd)

    if (nextConfig.versioning?.source === 'tag' && prevConfig.versioning.source !== 'tag') {
      assert.strictEqual((await getConfig(vcs.cwd)).versioning.source, 'tag')
    }
  }

  logger.info('Done')
}

export {
  upconf,
}
