const { declarePlugin } = require('@pvm/di')

module.exports = declarePlugin({
  configExt: {
    plugins_v2: [
      {
        plugin: './plugin-with-config-extension.js',
      },
    ],
  },
})
