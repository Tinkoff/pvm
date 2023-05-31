import type { StorageImpl } from '../storage.h'

// noop storage
export class ExternalStorage implements StorageImpl {
  async init(): Promise<void> {
    // noop
  }

  async finish(): Promise<void> {
    // noop
  }

  async downloadPath(_remotePath: string, _localDest: string): Promise<void> {
    // noop
  }

  async uploadPath(_localPath: string, _remoteDest: string): Promise<void> {
    // noop
  }
}
