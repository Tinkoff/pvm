import { declarePlugin } from '@pvm/di'

export default declarePlugin({
  configExt: {
    plugins_v2: [
      {
        plugin: require.resolve('@pvm/plugin-core'),
      },
      {
        plugin: require.resolve('@pvm/plugin-update'),
      },
    ],
  },
})
