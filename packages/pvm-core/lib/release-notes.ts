import { log } from './logger'
import { getHostApi } from './plugins'
import getCommits from './git/commits'
import { PlatformResult } from './shared'

import type { Vcs } from '@pvm/vcs/lib'
import type { ReleasePayload } from '@pvm/vcs/types'

async function prepareReleaseData(cwd: string, targetTag: string, prevRef: string): Promise<ReleasePayload> {
  log(`making release for ${targetTag} tag`)
  const commits = await getCommits(cwd, prevRef, targetTag)
  const hostApi = await getHostApi(cwd)

  log(`generating release notes from commits ${prevRef}..${targetTag}`)
  const releaseNotes = await hostApi.commitsToNotes(commits)

  return {
    name: targetTag,
    description: releaseNotes,
  }
}

async function makeReleaseForTag(vcs: Vcs, tagObject, prevRef: string): Promise<void> {
  const releaseData = await prepareReleaseData(vcs.cwd, tagObject.name, prevRef)

  // цель: обновить у существующего тега/релиза description в не зависимости от наличия релиза
  await vcs.upsertRelease(tagObject.name, releaseData)

  log(`release notes for ${tagObject.name} have written successfully`)
}

interface MakeReleaseForTagNameOpts {
  skipIfExists?: boolean,
}

// тег должен существовать
async function makeReleaseForTagName(vcs: Vcs, tagName: string, prevRef: string, opts: MakeReleaseForTagNameOpts = {}): Promise<void> {
  const { skipIfExists = false } = opts
  const releaseData = await prepareReleaseData(vcs.cwd, tagName, prevRef)

  const [responseCode, maybeRelease] = await vcs.getRelease(tagName)

  if (responseCode === PlatformResult.OK) {
    if (!maybeRelease!.description || !skipIfExists) {
      await vcs.editRelease(tagName, releaseData)
    } else {
      log(`release notes for ${tagName} already exists, skipping`)
      return
    }
  } else if (responseCode === PlatformResult.NOT_FOUND) { // тег есть, но нет релиза
    await vcs.createRelease(tagName, releaseData)
  } else if (responseCode === PlatformResult.NO_SUCH_TAG) {
    throw new Error(`Couldn't write release notes for tag "${tagName}". It doesn't exist.`)
  }

  log(`release notes for ${tagName} have written successfully`)
}

export {
  prepareReleaseData,
  makeReleaseForTag,
  makeReleaseForTagName,
}
