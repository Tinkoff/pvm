import { declarePlugin, provide } from '@pvm/di'
import { CLI_EXTENSION_TOKEN } from '@pvm/tokens-core'

import * as addTagCommand from './cli/pvm-add-tag'

export default declarePlugin({
  factory: function() {
    return {
      providers: [
        provide({
          provide: CLI_EXTENSION_TOKEN,
          useValue: [
            addTagCommand,
          ],
          multi: true,
        }),
      ],
    }
  },
})
