import { createToken } from '../lib/di'
import type { Config, HostApi, ReleaseMessageGenerator, AbstractVcs } from '../types'
import type { VcsPlatform } from '../mechanics/vcs'
import type { PlatformInterface } from '../mechanics/platform'
import type { GlobalFlags } from '../lib/cli/global-flags'
import type { IncrementalRenderer } from '../mechanics/changelog/types'
import type { AbstractMessengerClient, Notificator } from '../mechanics/notifications'
import type { Repository } from '../mechanics/repository'

export { DI_TOKEN } from '../lib/di'

export const CONFIG_TOKEN = createToken<Config>('CONFIG')
export const CWD_TOKEN = createToken<string>('CWD_TOKEN')
export const PLATFORM_TOKEN = createToken<PlatformInterface<any, any>>('PLATFORM_TOKEN')
export const RAW_PLATFORM_TOKEN = createToken<PlatformInterface<any, any>>('RAW_PLATFORM_TOKEN')
export const HOST_API_TOKEN = createToken<HostApi>('HOST_API_TOKEN')
export const VCS_TOKEN = createToken<AbstractVcs<any>>('VCS_TOKEN')
export const RAW_VCS_TOKEN = createToken<AbstractVcs<any>>('RAW_VCS_TOKEN')
export const VCS_PLATFORM_TOKEN = createToken<VcsPlatform>('VCS_PLATFORM_TOKEN')
export const VCS_PLATFORM_FACTORY_TOKEN = createToken<(opts: Partial<ConstructorParameters<typeof VcsPlatform>[0]>) => VcsPlatform>('VCS_PLATFORM_FACTORY_TOKEN')
export const GLOBAL_FLAGS_TOKEN = createToken<GlobalFlags>('GLOBAL_FLAGS_TOKEN')
export const CHANGELOG_RENDERERS_MAP = createToken<Record<string, IncrementalRenderer | null>>('CHANGELOG_RENDERERS_MAP')
export const CHANGELOG_CUSTOM_RENDERER = createToken<IncrementalRenderer>('CHANGELOG_RENDERER')
export const MESSENGER_CLIENT_TOKEN = createToken<AbstractMessengerClient>('MESSENGER_CLIENT_TOKEN', {
  multi: true,
})
export const NOTIFICATOR_TOKEN = createToken<Notificator>('NOTIFICATOR_TOKEN')
export const RELEASE_NOTIFICATIONS_MAP_TOKEN = createToken<Record<string, ReleaseMessageGenerator>>('RELEASE_NOTIFICATIONS_MAP_TOKEN', { multi: true })
export const REPOSITORY_FACTORY_TOKEN = createToken<(opts?: { ref: string | void }) => Repository>('REPOSITORY_FACTORY_TOKEN')