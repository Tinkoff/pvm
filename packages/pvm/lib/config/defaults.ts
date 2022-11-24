import type { Config } from '../../types'
import { defaultConfig } from '../../pvm-defaults'

function readDefaults(): Config {
  return defaultConfig as Config
}

export default readDefaults()
