import { CONFIG_TOKEN, PLATFORM_TOKEN } from '@pvm/tokens-core'
import { declarePlugin, provide } from '@pvm/di'
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
