import { CONFIG_TOKEN, CWD_TOKEN, declarePlugin, HOST_API_TOKEN, provide, RAW_PLATFORM_TOKEN } from '@pvm/pvm'
import { GithubPlatform } from './platform'

export default declarePlugin({
  factory: function() {
    return {
      providers: [
        provide({
          provide: RAW_PLATFORM_TOKEN,
          useClass: GithubPlatform,
          deps: {
            config: CONFIG_TOKEN,
            cwd: CWD_TOKEN,
            hostApi: HOST_API_TOKEN,
          },
        }),
      ],
    }
  },
})
