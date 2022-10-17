import { declarePlugin } from '@pvm/di'

export default declarePlugin({
  configExt: {
    plugins_v2: [
      { plugin: require.resolve('@pvm/plugin-core') },
      { plugin: require.resolve('@pvm/update/plugin') },
      { plugin: require.resolve('@pvm/pkgset/plugin') },
      { plugin: require.resolve('@pvm/releases/plugin') },
      { plugin: require.resolve('@pvm/artifacts/plugin') },
      { plugin: require.resolve('@pvm/vcs/plugin') },
      { plugin: require.resolve('@pvm/viz/plugin') },
      { plugin: require.resolve('@pvm/files/plugin') },
      { plugin: require.resolve('@pvm/changelog/plugin') },
      { plugin: require.resolve('@pvm/add-tag/plugin') },
      { plugin: require.resolve('@pvm/notifications/plugin') },
    ],
  },
})
