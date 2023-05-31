import type { InitStorageDeps, Storage } from './storage'
import type { StorageDef, Config } from '../../types'
import { ChangelogsStorage } from './frontend/changelogs'
import { ReleaseListStorage } from './frontend/release-list'
import { instatiateStorage } from './storage'
import { loggerFor } from '../../lib/logger'
import { CONFIG_TOKEN } from '../../tokens'

const logger = loggerFor('pvm:artifacts')

export enum ArtifactsStorages {
  ReleaseList = 'ReleaseList',
  Changelogs = 'Changelogs',
}

export type StorageEnumToFrontendClass<A extends ArtifactsStorages> =
  A extends ArtifactsStorages.ReleaseList ? ReleaseListStorage : ChangelogsStorage

function sanitizeStorageType(storageType: string): string {
  return storageType.toUpperCase().replace(/-/g, '')
}

export class StorageManager {
  initStorageDeps: InitStorageDeps
  _storages: Storage[] = []

  static ArtifactsStorages = ArtifactsStorages

  constructor(deps: InitStorageDeps) {
    this.initStorageDeps = deps
  }

  static isEnabledInConf(config: Config, storageType: ArtifactsStorages): boolean {
    switch (storageType) {
      case ArtifactsStorages.Changelogs:
        return config.changelog.enabled || config.changelog.for_packages.enabled
      case ArtifactsStorages.ReleaseList:
        return config.release_list.enabled
    }
  }

  static castStorageType(storageType: string): ArtifactsStorages | undefined {
    if (sanitizeStorageType(storageType) === ArtifactsStorages.ReleaseList.toUpperCase()) {
      return ArtifactsStorages.ReleaseList
    } else if (sanitizeStorageType(storageType) === ArtifactsStorages.Changelogs.toUpperCase()) {
      return ArtifactsStorages.Changelogs
    }
  }

  async init<S extends typeof Storage>(StorageKlass: S, storageDef: StorageDef): Promise<InstanceType<S>> {
    const storage = await instatiateStorage(StorageKlass, this.initStorageDeps, storageDef)
    this._storages.push(storage)
    return storage
  }

  async initFor<S extends ArtifactsStorages>(artifactsStorage: S): Promise<StorageEnumToFrontendClass<S>> {
    const { di } = this.initStorageDeps
    const config = di.get(CONFIG_TOKEN)
    switch (artifactsStorage) {
      case ArtifactsStorages.ReleaseList: {
        const result = await this.init(ReleaseListStorage, config.release_list.storage)
        logger.info(`Initialized ${result.name} storage for ReleaseList artifact`)
        return result
      }
      case ArtifactsStorages.Changelogs: {
        const result = await this.init(ChangelogsStorage, config.changelog.storage)
        logger.info(`Initialized ${result.name} storage for Changelogs artifact`)
        return result
      }
      default:
        throw new Error(`Unknown storage type: ${artifactsStorage}`)
    }
  }

  async finish(): Promise<void> {
    for (const storage of this._storages) {
      await storage.finish()
    }
    this._storages = []
  }
}
