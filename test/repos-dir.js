const os = require('os')
const path = require('path')

exports.reposDir = path.join(os.tmpdir(), 'pvm__repos')
