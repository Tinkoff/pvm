const os = require('os')
const path = require('path')

exports.mockDir = path.join(os.tmpdir(), 'pvm__mock')
