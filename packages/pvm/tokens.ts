import type { Config } from './types'

import { createToken } from './lib/di'
import type { Argv, Options } from 'yargs'
import type { Commit } from './types/git'
import type { PvmReleaseType } from './types/publish'
import type { AbstractMessengerClient } from './mechanics/notifications'
import type { VcsPlatform } from './mechanics/vcs/vcs'
import type { ReleaseContext } from './mechanics/update/types'
import type { UpdateState } from './mechanics/update/update-state'
import type { ReleaseData, ReleaseDataExt } from './mechanics/releases/types'
import type { Pkg } from './lib/pkg'
import type { ChangedContext } from './mechanics/update/changed-context'
import type { AbstractVcs } from './mechanics/vcs/types'
import type { GlobalFlags } from './lib/cli/global-flags'
import type { PlatformInterface } from './mechanics/vcs/platform-interface'
import type { MdUpdatedTable } from './mechanics/update/utils/md-table'
import type { IncrementalRenderer } from './mechanics/changelog/types'
import type { HostApi } from './types/host-api'

export { DI_TOKEN } from './lib/di'

export const CONFIG_TOKEN = createToken<Config>('CONFIG')
export const CWD_TOKEN = createToken<string>('CWD_TOKEN')
export const PLATFORM_TOKEN = createToken<PlatformInterface<any>>('PLATFORM_TOKEN')
export const HOST_API_TOKEN = createToken<HostApi>('HOST_API_TOKEN')
export const VCS_TOKEN = createToken<AbstractVcs<any>>('VCS_TOKEN')
export const VCS_PLATFORM_TOKEN = createToken<VcsPlatform>('VCS_PLATFORM_TOKEN')
export const VCS_PLATFORM_FACTORY_TOKEN = createToken<(opts: Partial<ConstructorParameters<typeof VcsPlatform>[0]>) => VcsPlatform>('VCS_PLATFORM_TOKEN')
export const VCS_PLATFORM_UPDATE_TOKEN = createToken<VcsPlatform>('VCS_PLATFORM_UPDATE_TOKEN')

type Command = {
  command: string,
  aliases?: string,
  description: string,
  builder?: ((yargs: Argv) => Argv) | { [key: string]: Options },
  handler:(flags: { [arg: string]: unknown }) => any | Promise<any>,
}
export const CLI_EXTENSION_TOKEN = createToken<Command | Command[]>('CLI_EXTENSION_TOKEN', { multi: true })
export const CLI_TOKEN = createToken<(opts: { argv: string[] }) => void>('CLI_TOKEN')
export const GLOBAL_FLAGS_TOKEN = createToken<GlobalFlags>('GLOBAL_FLAGS_TOKEN')

export const NOTIFY_SCRIPTS_PATH_TOKEN = createToken<() => Promise<string>>('NOTIFY_SCRIPTS_PATH_TOKEN')
export const RELEASE_TYPE_BY_COMMITS_TOKEN = createToken<(gitCommits: Array<Commit>) => Promise<PvmReleaseType | null> >('RELEASE_TYPE_BY_COMMITS_TOKEN')
export const RELEASE_TYPE_TOKEN = createToken<(pkg: Pkg, changedContext: ChangedContext) => Promise<PvmReleaseType | undefined> >('RELEASE_TYPE_TOKEN')
export const COMMITS_TO_NOTES_TOKEN = createToken<(gitCommits: Array<Commit>, maybePkg: Pkg | undefined, config: Config) => Promise<string> >('COMMITS_TO_NOTES_TOKEN')
export const RELEASE_TYPE_BUILDER_TOKEN = createToken<(gitCommits: Array<any>) => Promise<PvmReleaseType>>('RELEASE_TYPE_BUILDER_TOKEN')
export const MESSENGER_CLIENT_TOKEN = createToken<AbstractMessengerClient>('MESSENGER_CLIENT_TOKEN', {
  multi: true,
})
export const PRE_RELEASE_HOOK_TOKEN = createToken<(vcs: VcsPlatform, releaseContext: ReleaseContext) => Promise<void>>('PRE_RELEASE_HOOK_TOKEN', { multi: true })
export const ATTRIBUTE_RELEASE_DATA_HOOK_TOKEN = createToken<(releaseData: ReleaseData, updateState: UpdateState | null) => Promise<ReleaseDataExt>>('ATTRIBUTE_RELEASE_DATA_HOOK_TOKEN', { multi: true })
export const MARK_PR_HOOK_TOKEN = createToken<(vcs: VcsPlatform, updateState: UpdateState) => Promise<void>>('MARK_PR_HOOK_TOKEN', { multi: true })

export const RESOLVE_PUSH_REMOTE_TOKEN = createToken<() => Promise<string>>('RESOLVE_PUSH_REMOTE_TOKEN')

export const UPDATE_MD_TABLE_EXTEND_TOKEN = createToken<(mdUpdatedTable: MdUpdatedTable) => void>('UPDATE_MD_TABLE_EXTEND_TOKEN', { multi: true })

export const CHANGELOG_RENDERERS_MAP = createToken<Record<string, IncrementalRenderer | null>>('CHANGELOG_RENDERERS_MAP')
export const CHANGELOG_CUSTOM_RENDERER = createToken<IncrementalRenderer>('CHANGELOG_RENDERER')
