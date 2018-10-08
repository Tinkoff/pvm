import chalk from 'chalk'
import initVcs from '@pvm/vcs'
import { logger } from '@pvm/core/lib/logger'
import { getConfig } from '@pvm/core/lib/config'
import { StorageManager, ArtifactsStorages } from '../lib/storage-manager'

export interface ArtifactsTransferArgs {
  force?: boolean,
  quiet?: boolean,
  kind: ArtifactsStorages,
}

export type TransferDirection = 'upload' | 'download'

async function transfer(__args: ArtifactsTransferArgs, direction: TransferDirection): Promise<void> {
  const { kind, quiet = false, force = false } = __args
  const cwd = process.cwd()
  const config = await getConfig(cwd)
  const vcs = await initVcs({
    vcsType: 'fs',
    cwd,
  })

  const storageManager = new StorageManager({
    config,
    vcs,
  })

  const storageType = StorageManager.castStorageType(kind)
  if (!storageType) {
    throw new Error(`Unknown storage kind "${kind}"`)
  }
  logger.info(chalk`{yellow ${direction === 'upload' ? 'Uploading' : 'Downloading'} ${storageType} artifacts}`)

  try {
    const artifactsStorage = await storageManager.initFor(storageType)
    if (!StorageManager.isEnabledInConf(config, storageType) && !quiet && !force) {
      logger.warn(
        `${storageType} artifacts are not enabled. Enable it in config or pass --force option to ${direction} it anyway.`
      )
    }
    if (direction === 'download') {
      await artifactsStorage.download({ force: force })
    } else {
      await artifactsStorage.upload({ force: force })
    }
  } finally {
    await storageManager.finish()
  }
}

async function upload(args: ArtifactsTransferArgs): Promise<void> {
  await transfer(args, 'upload' as const)
}

async function download(args: ArtifactsTransferArgs): Promise<void> {
  await transfer(args, 'download' as const)
}

export {
  upload,
  download,
  transfer,
  ArtifactsStorages, // re-export
  StorageManager, // re-export
}
