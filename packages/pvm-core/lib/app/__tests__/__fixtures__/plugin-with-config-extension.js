const { declarePlugin } = require('@pvm/di')

module.exports = declarePlugin({
  configExt: {
    mark_pr: {
      analyze_update: true,
    },
  },
})
