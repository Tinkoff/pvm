import { CONFIG_TOKEN, PLATFORM_TOKEN, declarePlugin, provide } from '@pvm/pvm'
import { GitlabPlatform } from './platform'

export default declarePlugin({
  factory: function() {
    return {
      providers: [
        provide({
          provide: PLATFORM_TOKEN,
          useClass: GitlabPlatform,
          deps: {
            config: CONFIG_TOKEN,
          },
        }),
      ],
    }
  },
})
