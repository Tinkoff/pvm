
const { clone } = require('rfc6902/util')

function cloneJSON(value) {
  return JSON.parse(JSON.stringify(value))
}

const refObject = require('../package.json')

exports.compare = {
  clone() {
    var x = clone(refObject)
  },
  jsonClone() {
    var x = cloneJSON(refObject)
  },
};
require('bench').runMain()
