import type { Pkg } from '@pvm/core/lib/pkg'
import { AbstractPublishApplier } from './abstract'
import type { Repository } from '@pvm/repository'

export class BasicPublishApplier extends AbstractPublishApplier {
  // eslint-disable-next-line no-useless-constructor
  constructor(repo: Repository) {
    super(repo)
  }

  getPkgPublishVersion(pkg: Pkg): Promise<string> {
    return Promise.resolve(pkg.version)
  }
}
