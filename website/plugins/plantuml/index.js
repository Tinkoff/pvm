module.exports = function(context, { plantumlVersion }) {
  return {
    name: 'auto-plantuml',
    configureWebpack(config, isServer, utils) {
      return {
        module: {
          rules: [
            {
              test: /\.puml$/,
              use: [{
                loader: require.resolve('./loader'),
                options: {
                  plantumlVersion,
                },
              }],
            },
          ],
        },
      }
    },
  }
}
