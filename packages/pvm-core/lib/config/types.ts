import type { Operation } from 'rfc6902'
import type { Config as ConfigSchema } from '../../config-schema'

export type { StorageDef, ArtifactLimitDef } from '../../config-schema'

export interface Config extends ConfigSchema {
  cwd: string,
  // директория в которой искать конфигурационные файлы на случай, если мы работаем с неполным worktree
  configLookupDir: string,
  filepath: string | null,
  executionContext: {
    dryRun: boolean,
    local: boolean,
  },
}

export interface UpconfData {
  config_patch: Operation[],
}
