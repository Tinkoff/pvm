// eslint-disable-next-line import/no-extraneous-dependencies
const { declarePlugin, provide } = require('@pvm/pvm')

module.exports = declarePlugin({
  factory(opts) {
    return {
      providers: [
        provide({
          provide: 'TEST_TOKEN',
          useValue: opts.value,
        }),
      ],
    }
  },
})
