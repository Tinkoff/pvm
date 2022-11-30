import { PLATFORM_TOKEN, declarePlugin, provide, DI_TOKEN } from '@pvm/pvm'
import { GitlabPlatform } from './platform'

export * from './tokens'

export default declarePlugin({
  factory: function() {
    return {
      providers: [
        provide({
          provide: PLATFORM_TOKEN,
          useClass: GitlabPlatform,
          deps: {
            di: DI_TOKEN,
          },
        }),
      ],
    }
  },
})
