const stop = require('./gl-api-mock').stop

async function teardown() {
  await stop()
}

module.exports = teardown
