// eslint-disable-next-line import/no-extraneous-dependencies
const { declarePlugin } = require('@pvm/pvm')

module.exports = declarePlugin({
  configExt: {
    mark_pr: {
      analyze_update: true,
    },
  },
})
