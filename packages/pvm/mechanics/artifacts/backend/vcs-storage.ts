
import type { StorageImpl } from '../storage.h'
import type { VcsPlatform } from '../../vcs'

export class VcsStorage implements StorageImpl {
  // eslint-disable-next-line no-useless-constructor
  constructor(protected vcs: VcsPlatform) {
  }

  async init(): Promise<void> {
    // pass
  }

  async finish(): Promise<void> {
    // pass
  }

  async downloadPath(_remotePath: string, _localDest: string): Promise<void> {
    // noop
  }

  async uploadPath(localPath: string, _remoteDest: string): Promise<void> {
    await this.vcs.addPath(localPath)
  }
}
