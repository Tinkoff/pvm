import chalk from 'chalk'
import path from 'path'
import ignore from 'ignore'
import fs from 'fs'

import { pprintPackages } from '../../../lib/utils/pprint'
import { makeTagForPkg } from '../../../lib/tag-meta'
import { enpl } from '../../../lib/text/plural'
import { loggerFor } from '../../../lib/logger'
import { wdShell } from '../../../lib/shell'
import { releaseMark } from '../../../lib/consts'
import { getStagedFiles, revParse } from '../../../lib/git/commands'
import { versioningFile } from '../../../lib/dedicated-versions-file'
import { releaseDataMaker } from '../../releases/release-data'
import { fsAppendReleaseData } from '../../releases/release-list'
import { StorageManager } from '../../artifacts/storage-manager'

import getTemplateEnv from '../../template/env'
import { makeChangelog } from '../../changelog'

import { createReleaseContext } from './release-context'

import type { ReleaseContext, CliUpdateOpts } from '../types'
import type { UpdateState } from '../update-state'
import type { VcsPlatform } from '../../vcs'

import type{ ReleaseData } from '../../releases/types'
import type{ Config } from '../../../types'
import type { Container } from '../../../lib/di'
import { CONFIG_TOKEN, GLOBAL_FLAGS_TOKEN, HOST_API_TOKEN, PLATFORM_TOKEN, VCS_PLATFORM_TOKEN } from '../../../tokens'
import type { PlatformInterface } from '../../platform'

const logger = loggerFor('pvm:update')

const debug = logger.debug.bind(logger)
const log = logger.log.bind(logger)

export interface ReleaseOpts extends CliUpdateOpts {
  vcsMode?: 'vcs' | 'platform',
}

export async function release(di: Container, updateState: UpdateState, vcsPlatform: VcsPlatform, initialOpts: ReleaseOpts = {}): Promise<void> {
  const { targetRef } = updateState.changedContext
  const { config } = updateState.repo
  const releaseConf = config.release
  const opts = {
    ...initialOpts,
    local: initialOpts.local ?? false,
    tagOnly: initialOpts.tagOnly ?? releaseConf.tag_only,
  }
  const {
    tagOnly,
  } = opts

  if (isReleaseExists(config, targetRef)) {
    return
  }

  printReleasePackages(updateState)

  const commitContext = vcsPlatform.beginCommit()
  try {
    if (!tagOnly) {
      await includeStagedFiles(vcsPlatform)
      await removeWorkspaceReleaseFiles(updateState, vcsPlatform)
    }

    const releaseContext = await createReleaseContext(updateState)
    if (releaseContext) {
      await di.get(HOST_API_TOKEN).preReleaseHook(vcsPlatform, releaseContext)
      const { storageManager, releaseData } = await prepareStoreManagerAndReleaseData(di, releaseContext)
      await updateReleaseAndChangelogArtifacts(di, storageManager, releaseData)
      saveReleaseDataLocally(config.cwd, opts, releaseData)
      if (!tagOnly) {
        await updatePackages(vcsPlatform, updateState)
      }
    }

    // Ссылка на релиз либо от коммита который получен в результате пуша наработанных коммитов либо это целевая ссылка
    // если коммитить нечего
    const releaseRef = (await conditionallyPushChanges(di, updateState, vcsPlatform, opts)) ?? calculateReleaseRef(config.cwd, targetRef)

    if (releaseContext) {
      await createRelease(vcsPlatform, di.get(PLATFORM_TOKEN), releaseRef, updateState, releaseContext)
    }
  } catch (e) {
    await vcsPlatform.rollbackCommit(commitContext)
    throw e
  }
}

function isReleaseExists(config: Config, targetRef: string): boolean {
  const targetRefCommitBody = wdShell(config.cwd, `git log -1 --format=%b ${targetRef}`)
  if (targetRefCommitBody.trim().endsWith(releaseMark)) {
    log(chalk`{yellowBright skip releasing, this is a release commit already}`)
    return true
  }

  return false
}

function printReleasePackages(updateState: UpdateState): void {
  log(chalk`{yellowBright PACKAGES FOR RELEASE}`)
  pprintPackages(updateState.updateReasonMap.keys(), {
    'new version': pkg => chalk`{greenBright ${updateState.getNewVersionOrCurrent(pkg)}}`,
    reason: (pkg) => {
      return chalk`{greenBright ${updateState.updateReasonMap.get(pkg)}}`
    },
    'current version': pkg => pkg.version,
  })
}

async function includeStagedFiles(vcsPlatform: VcsPlatform): Promise<void> {
  const stagedFiles = getStagedFiles(vcsPlatform.cwd)
  await vcsPlatform.addFiles(stagedFiles)
  if (stagedFiles.length) {
    logger.info(`Followed staged files would be added to the release commit:\n${stagedFiles.join('\n')}`)
  }
}

async function removeWorkspaceReleaseFiles(updateState: UpdateState, vcsPlatform: VcsPlatform): Promise<void> {
  if (updateState.updateContext.readHintsFile) {
    await vcsPlatform.deleteFile(updateState.updateContext.readHintsFile)
  }

  for (const [pkg, releaseFilePath] of updateState.releaseFilesMap) {
    // git не умеет параллелиться
    await vcsPlatform.deleteFile(path.join(pkg.path, releaseFilePath))
  }
}

async function prepareStoreManagerAndReleaseData(di: Container, releaseContext: ReleaseContext): Promise<{
  releaseData?: ReleaseData,
  storageManager: StorageManager,
}> {
  const storageManager = new StorageManager({
    di,
  })

  const releaseData = await releaseDataMaker.fromReleaseContext(releaseContext)

  return {
    storageManager,
    releaseData,
  }
}

async function updateReleaseAndChangelogArtifacts(di: Container, storageManager: StorageManager, releaseData?: ReleaseData): Promise<void> {
  // 1. Download ReleaseList artifact
  // 2. Update ReleaseList and apply limits
  // 3. Upload ReleaseList artifact
  // 4. Download Changelog and Changelog for packages artifacts
  // 5. Two sceanarios:
  // 5. UPDATE. incremental: append ReleaseData; single-pass: Render updated ReleaseList
  // 5. CHANGELOG. incremental: NOOP, single-pass: Render ReleaseList
  // 6. UPDATE only: upload ReleaseList, Changelogs artifacts

  const config = di.get(CONFIG_TOKEN)
  const releaseListStorage = await storageManager.initFor(StorageManager.ArtifactsStorages.ReleaseList)

  if (config.release_list.enabled && releaseData) {
    await releaseListStorage.download()

    fsAppendReleaseData(config, releaseData)

    await releaseListStorage.upload()
  }

  const changelogConfig = config.changelog
  const changelogsStorage = await storageManager.initFor(StorageManager.ArtifactsStorages.Changelogs)

  if ((changelogConfig.enabled || changelogConfig.for_packages.enabled) && releaseData) {
    await changelogsStorage.download()

    await makeChangelog(di, releaseData)

    await changelogsStorage.upload()
  }

  await storageManager.finish()
}

function saveReleaseDataLocally(cwd: string, opts: ReleaseOpts, releaseData?: ReleaseData): void {
  if (opts.releaseDataFile) {
    if (releaseData) {
      if (!opts.dryRun) {
        fs.writeFileSync(path.resolve(cwd, opts.releaseDataFile), JSON.stringify(releaseData))
      }
      log(chalk`ReleaseData has been written to {italic "${opts.releaseDataFile}"}`)
    } else {
      log(chalk`You asked to save ReleaseData, but there are no commits in release.`)
    }
  }
}

function calculateReleaseRef(cwd: string, targetRef: string): string {
  return revParse(targetRef, cwd)
}

async function conditionallyPushChanges(di: Container, updateState: UpdateState, vcsPlatform: VcsPlatform, { local, tagOnly, vcsMode }: ReleaseOpts): Promise<string | undefined> {
  const { targetRef } = updateState.changedContext

  if (!local) {
    await checkBranchActual(di, targetRef)
  }

  if (vcsPlatform.isSomethingForCommit()) {
    if (tagOnly) {
      logger.error(`There are changes in worktree in tag-only mode! Please report this issue to pvm maintainers`)
      vcsPlatform.resetCommitContext()
    } else {
      // eslint-disable-next-line pvm/no-process-env
      if (process.env.__PVM_TESTING_FAIL_PUSH_0001_TEST_CASE && vcsMode !== 'platform') {
        const e = new Error('__PVM_TESTING_FAIL_PUSH_0001_TEST_CASE')
        // @ts-ignore
        e.context = 'push'
        throw e
      }

      return await pushChanges(di, vcsPlatform, updateState)
    }
  } else {
    vcsPlatform.resetCommitContext()
    log(chalk`{yellowBright NOTHING TO COMMIT}, update commit will not be created`)
  }
}

async function checkBranchActual(di: Container, targetRef: string): Promise<void> {
  const config = di.get(CONFIG_TOKEN)
  const vcs = di.get(VCS_PLATFORM_TOKEN)
  const platform = di.get(PLATFORM_TOKEN)
  const releaseOpts = config.release

  const maybeCurrentBranch = platform.getCurrentBranch()
  if (releaseOpts.ensure_branch_up_to_date && maybeCurrentBranch) {
    // before pushing changes, check for upstream branch is still actual
    debug(`checking ${maybeCurrentBranch} is still actual`)

    if (!(await vcs.isRefMatchesRemoteBranch(targetRef, maybeCurrentBranch))) {
      throw new Error(`${maybeCurrentBranch} has updated in the middle of updating packages, exiting`)
    }
  }
}

// метод делает коммит с обновлением версий
async function pushChanges(di: Container, vcs: VcsPlatform, updateState: UpdateState): Promise<string | undefined> {
  const templateEnv = await getTemplateEnv(di)
  const platform = di.get(PLATFORM_TOKEN)
  const dryRun = di.get(GLOBAL_FLAGS_TOKEN).getFlag('dryRun')

  let commitMessage = templateEnv.render('release-commit', {
    packages: updateState.getReleasePackages(),
    updateState,
  })

  commitMessage += `\n\n${releaseMark}`

  const updCommit = await vcs.commit(commitMessage, {
    branch: platform.getCurrentBranch(),
  })

  if (updCommit) {
    await vcs.push({
      remote: updateState.repo.config.update.push_remote,
    })
    const prefix = dryRun ? 'DRY RUN: ' : ''
    logger.info(`${prefix}changes have been committed, sha: ${updCommit.id}`)

    return updCommit.id
  } else {
    logger.info(`Commit was not created`)
  }
}

async function updatePackages(vcs: VcsPlatform, updateState: UpdateState): Promise<void> {
  const { config } = updateState.repo
  const versioning_source = config.versioning.source

  if (versioning_source === 'tag') {
    // если у нас источник всех версий это теги, то всю работу по тегам делает createRelease
    return
  }

  const gitignore = ignore()
  if (fs.existsSync('.gitignore')) {
    const ignoreText = fs.readFileSync('.gitignore').toString()
    gitignore.add(ignoreText)
  }

  const dedicatedVersionsMap = versioning_source === 'file' ? updateState.repo.getVersionsMap() : {}
  let versionsChanged = false

  for (const pkg of updateState.getReleasePackages().values()) {
    if (!pkg.isRoot && gitignore.ignores(pkg.path)) {
      continue
    }
    if (versioning_source === 'file') {
      if (!pkg.isRoot) {
        dedicatedVersionsMap[pkg.name] = pkg.version
        versionsChanged = true
      }
    } else {
      // package.json может и не нуждаться в обновлении, но на релиз он будет включен
      // например если это новый пакет
      await vcs.updateFile(
        path.normalize(`${pkg.path}/package.json`),
        pkg.stringify()
      )
    }
  }
  if (versioning_source === 'file' && versionsChanged) {
    await vcs.updateFile(
      path.normalize(config.versioning.source_file),
      versioningFile.stringify(dedicatedVersionsMap)
    )
  }
}

async function createRelease(vcs: VcsPlatform, platform: PlatformInterface<any, any>, sha: string, updateState: UpdateState, releaseContext: ReleaseContext): Promise<void> {
  const { config } = updateState.repo
  const { for_packages } = config.tagging

  const concurrency = 4 // max 4 requests at once
  let reqs: Promise<unknown>[] = []

  logger.info(chalk`creating release tag {underline ${releaseContext.releaseTag}} on ref:${sha}`)
  logger.info('tagAnnotation:', releaseContext.tagAnnotation)
  debug('release-notes:', releaseContext.releaseNotes)
  await platform.addTagAndRelease(sha, releaseContext.releaseTag, {
    name: releaseContext.name,
    description: releaseContext.releaseNotes,
    annotation: releaseContext.tagAnnotation || undefined,
  })

  const createPackagesTags = for_packages.enabled && releaseContext.updateState.repo.isMonorepo

  if (createPackagesTags) {
    log(`creating package tags..`)

    let tagsCreated = 0
    let pkgsetIndex = 0

    const pkgsetForRelease = Array.from(releaseContext.updateState.getReleasePackages().entries())

    while (pkgsetIndex < pkgsetForRelease.length) {
      const [oldPkg, newPkg] = pkgsetForRelease[pkgsetIndex++]
      const newTagName = makeTagForPkg(config, newPkg)

      debug(`(${newPkg.name}): tag_name=${newTagName} ref=${sha}`)

      /**
       * @TODO: добавить идемпотентности. Если падает джоба update, то при перезапуске делается новый комит и новый тег.
       * Нужно это обрабатывать, и делать только то, что не было сделано в упавшей джобе.
       */
      let maybePromise
      if (for_packages.as_release) {
        maybePromise = platform.addTagAndRelease(sha, newTagName, {
          name: `${newPkg.name} ${newPkg.version}`,
          description: updateState.releaseNotes.get(oldPkg) || '',
        })
      } else {
        maybePromise = vcs.addTag(newTagName, sha, {
          annotation: updateState.releaseNotes.get(oldPkg),
        })
      }

      tagsCreated += 1
      reqs.push(Promise.resolve(maybePromise))

      if (reqs.length >= concurrency || pkgsetIndex === pkgsetForRelease.length) {
        await Promise.all(reqs)
        reqs = []
      }
    }

    log(enpl(
      [
        'no tags created',
        'one tag has created',
        '%1 tags have created',
      ],
      tagsCreated
    ))

    // отдельно пушим теги
    await vcs.push({
      skipCi: true,
      remote: config.update.push_remote,
    })
  }
}
