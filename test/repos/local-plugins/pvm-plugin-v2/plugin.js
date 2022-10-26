module.exports = {
  configExt: {},
  factory: () => {
    console.log(`plugin_v2 loaded successfully`)

    return {
      providers: [],
    }
  },
}
