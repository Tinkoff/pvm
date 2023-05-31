import type { Config as ConfigSchema } from './config-schema'

export type Config = ConfigSchema & {
  cwd: string,
  /**
   * @deprecated needs for backward compatibility with old plugin loading system
   */
  configLookupDir: string,
}
