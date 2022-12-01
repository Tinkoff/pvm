import { declarePlugin, provide, DI_TOKEN, RAW_PLATFORM_TOKEN } from '@pvm/pvm'
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
          },
        }),
      ],
    }
  },
})
