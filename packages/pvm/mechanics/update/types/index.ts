import type { UpdateState } from '../update-state'
import type { PvmReleaseType } from '../../../types'
import type { ImmutablePkgSet } from '../../../lib/pkg-set'

import type { VcsPlatform } from '../../../mechanics/vcs'
import type { CliUpdateOpts } from './cli'
import type { Container } from '../../../lib/di'

export type { CliUpdateOpts, VcsPlatform }

export interface UpdateMethod<R> {
  run(di: Container, updateState: UpdateState, vcs: VcsPlatform, args: CliUpdateOpts): Promise<R>,
  prepare?(di: Container, vcs: VcsPlatform): Promise<unknown>,
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
