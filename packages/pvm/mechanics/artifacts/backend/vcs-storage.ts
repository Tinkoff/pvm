
import type { VcsPlatform } from '../../vcs'
import type { StorageImpl } from '../storage.h'

export class VcsStorage implements StorageImpl {
  vcs: VcsPlatform

  constructor(vcs: VcsPlatform) {
    this.vcs = vcs
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
