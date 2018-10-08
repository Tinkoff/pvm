import { Storage } from '../storage'
import type { IOOpts } from '../storage.h'

export class ReleaseListStorage extends Storage {
  async download(opts: IOOpts = {}): Promise<void> {
    if (opts.force || this.config.release_list.enabled) {
      this.logger.info('Download ReleaseList artifact')
      await this.downloadPath(this.config.release_list.path)
    }
  }

  async upload(opts: IOOpts = {}): Promise<void> {
    if (opts.force || this.config.release_list.enabled) {
      this.logger.info('Upload ReleaseList artifact')
      await this.uploadPath(this.config.release_list.path)
    }
  }
}
