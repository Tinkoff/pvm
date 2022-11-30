import type { Commit } from './git'
import type { Pkg } from '../lib/pkg'
import type { PvmReleaseType, SemverReleaseType } from './publish'
import type { ChangedContext } from '../mechanics/update/changed-context'
import type { VcsPlatform } from '../mechanics/vcs'
import type { ReleaseContext } from '../mechanics/update/types'
import type { ReleaseData, ReleaseDataExt } from '../mechanics/releases/types'
import type { UpdateState } from '../mechanics/update/update-state'

export interface HostApi {
  commitsToNotes(commits: Commit[], maybePkg?: Pkg | void): Promise<string>,
  releaseTypeByCommits(commits: Commit[], defaultValue?: SemverReleaseType | null): Promise<PvmReleaseType | null>,
  releaseType(pkg: Pkg, changedContext: ChangedContext): Promise<PvmReleaseType | undefined>,
  preReleaseHook(vcs: VcsPlatform, releaseContext: ReleaseContext): Promise<void[]>,
  attributeReleaseData(releaseData: ReleaseData, updateState: UpdateState | null): Promise<ReleaseDataExt>,
  notifyScriptsPath(): Promise<string>,
}
