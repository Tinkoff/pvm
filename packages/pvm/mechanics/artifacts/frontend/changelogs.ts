import { Storage } from '../storage'
import type { IOOpts } from '../storage.h'

export class ChangelogsStorage extends Storage {
  async download(opts: IOOpts = {}): Promise<void> {
    if (opts.force || this.config.changelog.enabled) {
      this.logger.info(`Download main changelog`)
      await this.downloadPath(this.config.changelog.path)
    }
    if (opts.force || this.config.changelog.for_packages.enabled) {
      this.logger.info('Download changelogs for packages')
      await this.downloadPath(this.config.changelog.for_packages.output_dir)
    }
  }

  async upload(opts: IOOpts = {}): Promise<void> {
    if (opts.force || this.config.changelog.enabled) {
      this.logger.info('Upload main changelog')
      await this.uploadPath(this.config.changelog.path)
    }
    if (opts.force || this.config.changelog.for_packages.enabled) {
      this.logger.info('Upload changelogs for packages')
      await this.uploadPath(this.config.changelog.for_packages.output_dir)
    }
  }
}
