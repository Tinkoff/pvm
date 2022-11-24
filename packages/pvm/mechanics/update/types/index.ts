import type { UpdateState } from '../update-state'
import type { PvmReleaseType } from '../../../types'
import type { ImmutablePkgSet } from '../../../lib/pkg-set'

import type { Vcs } from '../../../mechanics/vcs'
import type { CliUpdateOpts } from './cli'
import type { Container } from '../../../lib/di'

export type { CliUpdateOpts, Vcs }

export interface UpdateMethod<R> {
  run(di: Container, updateState: UpdateState, vcs: Vcs, args: CliUpdateOpts): Promise<R>,
  prepare?(di: Container, vcs: Vcs): Promise<unknown>,
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
