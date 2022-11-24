import type { UpdateState } from '../update-state'
import type { PvmReleaseType, Config } from '../../../types'
import type { ImmutablePkgSet } from '../../../lib/pkg-set'

import type { Vcs } from '../../../mechanics/vcs'
import type { CliUpdateOpts } from './cli'

export type { CliUpdateOpts, Vcs }

export interface UpdateMethod<R> {
  run(updateState: UpdateState, vcs: Vcs, args: CliUpdateOpts): Promise<R>,
  prepare?(config: Config, vcs: Vcs): Promise<unknown>,
}

export interface ForceReleaseState {
  packages: ImmutablePkgSet,
  defaultReleaseType?: PvmReleaseType,
}

export interface ReleaseContext {
  name: string,
  tagAnnotation: string,
  releaseTag: string,
  releaseNotes: string,
  updateState: UpdateState,
}
