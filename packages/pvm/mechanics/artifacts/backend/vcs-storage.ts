
import type { StorageImpl } from '../storage.h'

export class VcsStorage implements StorageImpl {
  async init(): Promise<void> {
    // pass
  }

  async finish(): Promise<void> {
    // pass
  }

  async downloadPath(_remotePath: string, _localDest: string): Promise<void> {
    // noop
  }

  async uploadPath(): Promise<void> {
  }
}
