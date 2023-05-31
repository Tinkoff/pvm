import {
  declarePlugin,
  provide,
  DI_TOKEN,
  RAW_PLATFORM_TOKEN,
  GLOBAL_FLAGS_TOKEN,
  CWD_TOKEN,
  HOST_API_TOKEN, CONFIG_TOKEN,
} from '@pvm/pvm'
import { GitlabPlatform } from './platform'

export * from './tokens'

export default declarePlugin({
  factory: function() {
    return {
      providers: [
        provide({
          provide: RAW_PLATFORM_TOKEN,
          useClass: GitlabPlatform,
          deps: {
            di: DI_TOKEN,
            cwd: CWD_TOKEN,
            hostApi: HOST_API_TOKEN,
            globalFlags: GLOBAL_FLAGS_TOKEN,
            config: CONFIG_TOKEN,
          },
        }),
      ],
    }
  },
})
