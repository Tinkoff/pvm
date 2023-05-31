// eslint-disable-next-line import/no-extraneous-dependencies
const { declarePlugin } = require('@pvm/pvm')

module.exports = declarePlugin({
  configExt: {
    plugins_v2: [
      {
        plugin: './plugin-with-config-extension.js',
      },
    ],
  },
})
