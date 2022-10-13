import { CONFIG_TOKEN, PLATFORM_TOKEN } from '@pvm/tokens-common'
import { declarePlugin, provide } from '@pvm/di'
import { GithubPlatform } from './platform'

export default declarePlugin({
  factory: function() {
    return {
      providers: [
        provide({
          provide: PLATFORM_TOKEN,
          useClass: GithubPlatform,
          deps: {
            config: CONFIG_TOKEN,
          },
        }),
      ],
    }
  },
})
