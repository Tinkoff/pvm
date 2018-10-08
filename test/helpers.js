const fs = require('fs')
const assert = require('assert')
const path = require('path')
const util = require('util')
const sprout = require('sprout-data')
const TOML = require('@iarna/toml')

const writeFile = util.promisify(fs.writeFile)

function writeConfig(repo, config, configFormat = 'json') {
  const configPath = path.join(repo.dir, `.pvm.${configFormat}`)
  assert.ok(
    configFormat === 'json' || configFormat === 'toml' || configFormat === 'js',
    `Config format should be one of "toml", "json" or "js". Got "${configFormat}" instead.`
  )
  if (fs.existsSync(configPath)) {
    assert.ok(
      configFormat !== 'js',
      `Merging of configs is not supported for ".js" config.`
    )
    const contents = fs.readFileSync(configPath).toString('utf-8')
    const existsConfig = configFormat === 'json' ? JSON.parse(contents) : TOML.parse(contents)
    config = sprout.deepMerge(existsConfig, config)
  }

  let newContents
  switch (configFormat) {
    case 'json':
      newContents = JSON.stringify(config, null, 2)
      break
    case 'toml':
      newContents = TOML.stringify(config)
      break
    case 'js':
      newContents = `module.exports = ${config}`
  }
  return writeFile(configPath, newContents)
}

exports.writeConfig = writeConfig
