import { declarePlugin, provide } from '@pvm/di'
import { CLI_EXTENSION_TOKEN } from '@pvm/tokens-core'

import * as command from './cli/pvm-files'

export default declarePlugin({
  factory: function() {
    return {
      providers: [
        provide({
          provide: CLI_EXTENSION_TOKEN,
          useValue: command,
          multi: true,
        }),
      ],
    }
  },
})
