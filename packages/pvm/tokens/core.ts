import { createToken } from '../lib/di'
import type { Config, HostApi, ReleaseMessageGenerator } from '../types'
import type { PlatformInterface, VcsPlatform } from '../mechanics/vcs'
import type { AbstractVcs } from '../mechanics/vcs/types'
import type { GlobalFlags } from '../lib/cli/global-flags'
import type { IncrementalRenderer } from '../mechanics/changelog/types'
import type { AbstractMessengerClient } from '../mechanics/notifications'

export { DI_TOKEN } from '../lib/di'

export const CONFIG_TOKEN = createToken<Config>('CONFIG')
export const CWD_TOKEN = createToken<string>('CWD_TOKEN')
export const PLATFORM_TOKEN = createToken<PlatformInterface<any>>('PLATFORM_TOKEN')
export const HOST_API_TOKEN = createToken<HostApi>('HOST_API_TOKEN')
export const VCS_TOKEN = createToken<AbstractVcs<any>>('VCS_TOKEN')
export const VCS_PLATFORM_TOKEN = createToken<VcsPlatform>('VCS_PLATFORM_TOKEN')
export const VCS_PLATFORM_FACTORY_TOKEN = createToken<(opts: Partial<ConstructorParameters<typeof VcsPlatform>[0]>) => VcsPlatform>('VCS_PLATFORM_TOKEN')
export const VCS_PLATFORM_UPDATE_TOKEN = createToken<VcsPlatform>('VCS_PLATFORM_UPDATE_TOKEN')
export const GLOBAL_FLAGS_TOKEN = createToken<GlobalFlags>('GLOBAL_FLAGS_TOKEN')
export const CHANGELOG_RENDERERS_MAP = createToken<Record<string, IncrementalRenderer | null>>('CHANGELOG_RENDERERS_MAP')
export const CHANGELOG_CUSTOM_RENDERER = createToken<IncrementalRenderer>('CHANGELOG_RENDERER')
export const MESSENGER_CLIENT_TOKEN = createToken<AbstractMessengerClient>('MESSENGER_CLIENT_TOKEN', {
  multi: true,
})
export const RELEASE_NOTIFICATIONS_MAP_TOKEN = createToken<Record<string, ReleaseMessageGenerator>>('RELEASE_NOTIFICATIONS_MAP_TOKEN', { multi: true })
