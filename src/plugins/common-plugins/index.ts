import { declarePlugin } from '@pvm/di'

export default declarePlugin({
  configExt: {
    plugins_v2: [
      {
        plugin: '@pvm/plugin-cli',
      },
    ],
  },
})
