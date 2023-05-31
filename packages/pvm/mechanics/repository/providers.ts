import { provide } from '../../lib/di'
import { Repository } from './repository'
import { CONFIG_TOKEN, CWD_TOKEN, HOST_API_TOKEN, PLATFORM_TOKEN, REPOSITORY_FACTORY_TOKEN } from '../../tokens'

export default [
  provide({
    provide: REPOSITORY_FACTORY_TOKEN,
    useFactory({
      config,
      hostApi,
      platform,
      cwd,
    }) {
      return ({ ref }: { ref: string | void } = { ref: undefined }) => new Repository({
        config,
        hostApi,
        platform,
        ref,
        cwd,
      })
    },
    deps: {
      config: CONFIG_TOKEN,
      hostApi: HOST_API_TOKEN,
      platform: PLATFORM_TOKEN,
      cwd: CWD_TOKEN,
    },
  }),
]
