import type { UpdateState } from '../lib/update-state'
import type { PvmReleaseType } from '@pvm/core/types'
import type { ImmutablePkgSet } from '@pvm/core/lib/pkg-set'
import type { Config } from '@pvm/core/lib/config/types'
import type { Vcs } from '@pvm/vcs'
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
