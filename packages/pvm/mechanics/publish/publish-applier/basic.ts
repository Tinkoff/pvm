import type { Pkg } from '../../../lib/pkg'
import { AbstractPublishApplier } from './abstract'
import type { Repository } from '../../repository'

export class BasicPublishApplier extends AbstractPublishApplier {
  // eslint-disable-next-line no-useless-constructor
  constructor(repo: Repository) {
    super(repo)
  }

  getPkgPublishVersion(pkg: Pkg): Promise<string> {
    return Promise.resolve(pkg.version)
  }
}
