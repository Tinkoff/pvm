import getConfig, { clearConfigCacheFor, loadRawConfig, getConfigWithoutIncludes } from './get-config'
import type { Config } from './types'
import defaultConfig from './defaults'

export {
  Config,
  getConfig,
  defaultConfig,
  clearConfigCacheFor,
  loadRawConfig,
  getConfigWithoutIncludes,
}
