import { provide } from '../../lib/di'
import {
  CWD_TOKEN,
  GLOBAL_FLAGS_TOKEN,
  HOST_API_TOKEN,
  PLATFORM_TOKEN,
  RAW_PLATFORM_TOKEN,
  VCS_TOKEN,
} from '../../tokens'
import { DecoratedPlatform } from './decorated-platform'

export default [
  provide({
    provide: PLATFORM_TOKEN,
    useClass: DecoratedPlatform,
    deps: {
      platform: RAW_PLATFORM_TOKEN,
      vcs: VCS_TOKEN,
      globalFlags: GLOBAL_FLAGS_TOKEN,
      cwd: CWD_TOKEN,
      hostApi: HOST_API_TOKEN,
    },
  }),
]
