import { declarePlugin, provide } from '@pvm/di'
import { CLI_EXTENSION_TOKEN } from '@pvm/tokens-core'

import * as updateCommand from './cli/pvm-update'
import * as updateLocalCommand from './cli/pvm-update-local'

export default declarePlugin({
  factory: function() {
    return {
      providers: [
        provide({
          provide: CLI_EXTENSION_TOKEN,
          useValue: [
            updateCommand,
            updateLocalCommand,
          ],
          multi: true,
        }),
      ],
    }
  },
})
