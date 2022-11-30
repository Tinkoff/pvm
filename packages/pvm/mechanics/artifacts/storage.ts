import path from 'path'
import { GitBranchStorage } from './backend/git-branch-storage'
import { VcsStorage } from './backend/vcs-storage'
import { ExternalStorage } from './backend/external-storage'
import { loggerFor } from '../../lib/logger'

import type { Config, StorageDef } from '../../types'

import type { StorageImpl } from './storage.h'
import type { Container } from '../../lib/di'
import { CONFIG_TOKEN } from '../../tokens'

const finalizedMap = new WeakMap<StorageImpl, boolean>()
const storagesPool = new Map<string, StorageImpl>()

const logger = loggerFor('pvm:artifacts')

export interface InitStorageDeps {
  di: Container,
}

export interface StorageOpts {
  config: Config,
  type: StorageDef['type'],
  destPrefix?: string,
}

export class Storage {
  destPrefix?: string
  storage: StorageImpl
  config: Config
  type: StorageDef['type']
  logger = logger

  constructor(storage: StorageImpl, opts: StorageOpts) {
    this.storage = storage
    this.config = opts.config
    this.destPrefix = opts.destPrefix
    this.type = opts.type
  }

  get finalized(): boolean {
    return finalizedMap.has(this.storage)
  }

  get name(): string {
    return this.storage.constructor.name
  }

  async finish(): Promise<void> {
    if (!this.finalized) {
      finalizedMap.set(this.storage, false)
      await this.storage.finish()
      finalizedMap.set(this.storage, true)
      for (const [key, storage] of storagesPool.entries()) {
        if (storage === this.storage) {
          storagesPool.delete(key)
        }
      }
    }
  }

  async uploadPath(localPath: string): Promise<unknown> {
    if (!this.finalized) {
      const remotePath = this.destPrefix ? path.join(this.destPrefix, localPath) : localPath
      logger.info(`Upload "${localPath}" to "${remotePath}"`)
      if (this.config.executionContext.dryRun || this.config.executionContext.local) {
        logger.info(`skip uploading due to ${this.config.executionContext.dryRun ? 'dry run' : 'local mode'}`)
        return
      }
      return await this.storage.uploadPath(localPath, remotePath)
    } else {
      throw new Error(`Storage: couldn't upload in wrong lifecycle period, finalized:${this.finalized}`)
    }
  }

  async downloadPath(wantedLocalPath: string): Promise<unknown> {
    if (!this.finalized) {
      const remotePath = this.destPrefix ? path.join(this.destPrefix, wantedLocalPath) : wantedLocalPath
      logger.info(`Download "${remotePath}" to "${wantedLocalPath}"`)
      if (this.config.executionContext.dryRun) {
        logger.info('skip downloading due to dry run')
        return
      }
      return await this.storage.downloadPath(remotePath, wantedLocalPath)
    } else {
      throw new Error(`Storage: couldn't download in wrong lifecycle period, finalized:${this.finalized}`)
    }
  }
}

function createStorageImpl(deps: InitStorageDeps, storageDef: StorageDef): StorageImpl {
  if (storageDef.type === 'repo') {
    return new VcsStorage()
  } else if (storageDef.type === 'branch') {
    return new GitBranchStorage({ di: deps.di, branch: storageDef.branch })
  } else if (storageDef.type === 'external') {
    return new ExternalStorage()
  }
  throw new Error(`createStorage: unknown storage type "${(storageDef as any).type}"`)
}

async function lazyInitStorageImpl(deps: InitStorageDeps, storageDef: StorageDef): Promise<StorageImpl> {
  const storageKey = [storageDef.type, storageDef.type === 'branch' ? storageDef.branch : ''].join('_')
  // storagePool нужен для того чтобы не инициализировать два раза worktree для аплоада артифактов,
  // если у нас например два стоража имеет один и тот же тип branch.
  // В случае вызова finish нужно удалять storage из пула
  if (!storagesPool.has(storageKey)) {
    const storage = createStorageImpl(deps, storageDef)
    await storage.init()
    storagesPool.set(storageKey, storage)
  }
  return storagesPool.get(storageKey)!
}

export async function instatiateStorage<S extends typeof Storage>(StorageKlass: S, deps: InitStorageDeps, storageDef: StorageDef): Promise<InstanceType<S>> {
  const storage = await lazyInitStorageImpl(deps, storageDef)
  return new StorageKlass(storage, {
    type: storageDef.type,
    config: deps.di.get(CONFIG_TOKEN),
    destPrefix: storageDef.type !== 'external' ? storageDef.dest : undefined,
  }) as unknown as InstanceType<S>
}
