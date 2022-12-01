import fs from 'fs'
import assert from 'assert'
import path from 'path'
import util from 'util'
import * as sprout from 'sprout-data'
import TOML from '@iarna/toml'
import type { Config, RecursivePartial } from '@pvm/pvm'

const writeFile = util.promisify(fs.writeFile)

export function writeConfig(repo: { dir: string }, config: RecursivePartial<Config>, configFormat: 'json' | 'js' | 'toml' = 'json') {
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
      newContents = TOML.stringify(config as any)
      break
    case 'js':
      newContents = `module.exports = ${config}`
  }
  return writeFile(configPath, newContents)
}
