import fs from 'fs'
import assert from 'assert'
import path from 'path'
import util from 'util'
import * as sprout from 'sprout-data'
import TOML from '@iarna/toml'
import type { Config, RecursivePartial } from '@pvm/pvm'

const writeFile = util.promisify(fs.writeFile)

export function writeConfig<T extends RecursivePartial<Config> | string>(repo: { dir: string }, config: T, passedFormat?: T extends string ? 'js' : 'json' | 'toml'): Promise<void> {
  const configFormat = passedFormat ?? 'json'
  const configPath = path.join(repo.dir, `.pvm.${configFormat}`)
  assert.ok(
    configFormat === 'json' || configFormat === 'toml' || configFormat === 'js',
    `Config format should be one of "toml", "json" or "js". Got "${configFormat}" instead.`
  )
  if (fs.existsSync(configPath)) {
    if (configFormat === 'js') {
      throw new Error(`Merging of configs is not supported for ".js" config.`)
    }

    // fix inability of ts to infer config type from configFormat type assertion
    if (typeof config === 'string') {
      throw new Error('Config in string and js format. Merge is impossible')
    }

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
      break
    default:
      throw new Error('Unknown format')
  }
  return writeFile(configPath, newContents)
}
