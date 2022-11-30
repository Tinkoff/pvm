import { createToken } from '../lib/di'
import type { Commit, Config, PvmReleaseType } from '../types'
import type { Pkg } from '../lib/pkg'
import type { ChangedContext } from '../mechanics/update/changed-context'
import type { VcsPlatform } from '../mechanics/vcs'
import type { ReleaseContext } from '../mechanics/update/types'
import type { ReleaseData, ReleaseDataExt } from '../mechanics/releases/types'
import type { UpdateState } from '../mechanics/update/update-state'
import type { MdUpdatedTable } from '../mechanics/update/utils/md-table'

export const NOTIFY_SCRIPTS_PATH_TOKEN = createToken<() => Promise<string>>('NOTIFY_SCRIPTS_PATH_TOKEN')
export const RELEASE_TYPE_BY_COMMITS_TOKEN = createToken<(gitCommits: Array<Commit>) => Promise<PvmReleaseType | null> >('RELEASE_TYPE_BY_COMMITS_TOKEN')
export const RELEASE_TYPE_TOKEN = createToken<(pkg: Pkg, changedContext: ChangedContext) => Promise<PvmReleaseType | undefined> >('RELEASE_TYPE_TOKEN')
export const COMMITS_TO_NOTES_TOKEN = createToken<(gitCommits: Array<Commit>, maybePkg: Pkg | undefined, config: Config) => Promise<string> >('COMMITS_TO_NOTES_TOKEN')
export const RELEASE_TYPE_BUILDER_TOKEN = createToken<(gitCommits: Array<any>) => Promise<PvmReleaseType>>('RELEASE_TYPE_BUILDER_TOKEN')
export const PRE_RELEASE_HOOK_TOKEN = createToken<(vcs: VcsPlatform, releaseContext: ReleaseContext) => Promise<void>>('PRE_RELEASE_HOOK_TOKEN', { multi: true })
export const ATTRIBUTE_RELEASE_DATA_HOOK_TOKEN = createToken<(releaseData: ReleaseData, updateState: UpdateState | null) => Promise<ReleaseDataExt>>('ATTRIBUTE_RELEASE_DATA_HOOK_TOKEN', { multi: true })
export const MARK_PR_HOOK_TOKEN = createToken<(vcs: VcsPlatform, updateState: UpdateState) => Promise<void>>('MARK_PR_HOOK_TOKEN', { multi: true })
export const RESOLVE_PUSH_REMOTE_TOKEN = createToken<() => Promise<string>>('RESOLVE_PUSH_REMOTE_TOKEN')
export const UPDATE_MD_TABLE_EXTEND_TOKEN = createToken<(mdUpdatedTable: MdUpdatedTable) => void>('UPDATE_MD_TABLE_EXTEND_TOKEN', { multi: true })
