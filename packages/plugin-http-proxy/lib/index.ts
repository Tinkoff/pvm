// @ts-ignore
import { bootstrap } from 'global-agent'
import { declarePlugin } from '@pvm/pvm'

export default declarePlugin({
  factory: () => {
    bootstrap({
      environmentVariableNamespace: '',
    })

    return {
      providers: [],
    }
  },
})
