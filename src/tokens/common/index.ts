import type { Config, BasePlatformInterface } from '@pvm/types'

import { createToken } from '@pvm/di'

export const CONFIG_TOKEN = createToken<Config>('CONFIG')
export const CWD_TOKEN = createToken<string>('CWD_TOKEN')
export const REPO_TOKEN = createToken<string>('REPO_TOKEN')
/**
 * @deprecated use new plugin system and DI instead
 */
export const HOST_API = createToken<any>('HOST_API')

export const PLATFORM_TOKEN = createToken<BasePlatformInterface<any>>('PLATFORM_TOKEN')
