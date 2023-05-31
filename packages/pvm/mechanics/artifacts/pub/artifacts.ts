import chalk from 'chalk'
import { logger } from '../../../lib/logger'
import { StorageManager, ArtifactsStorages } from '../storage-manager'
import type { Container } from '../../../lib/di'
import { CONFIG_TOKEN } from '../../../tokens'

export interface ArtifactsTransferArgs {
  force?: boolean,
  quiet?: boolean,
  kind: ArtifactsStorages,
}

export type TransferDirection = 'upload' | 'download'

async function transfer(di: Container, __args: ArtifactsTransferArgs, direction: TransferDirection): Promise<void> {
  const { kind, quiet = false, force = false } = __args
  const config = di.get(CONFIG_TOKEN)

  const storageManager = new StorageManager({
    di,
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

async function upload(di: Container, args: ArtifactsTransferArgs): Promise<void> {
  await transfer(di, args, 'upload' as const)
}

async function download(di: Container, args: ArtifactsTransferArgs): Promise<void> {
  await transfer(di, args, 'download' as const)
}

export {
  upload,
  download,
  transfer,
  ArtifactsStorages, // re-export
  StorageManager, // re-export
}
