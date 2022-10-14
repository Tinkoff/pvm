import type { Config as ConfigSchema } from '@pvm/types'

export type { StorageDef, ArtifactLimitDef } from '@pvm/types'

export interface Config extends ConfigSchema {
  cwd: string,
  // директория в которой искать конфигурационные файлы на случай, если мы работаем с неполным worktree
  configLookupDir: string,
  executionContext: {
    dryRun: boolean,
    local: boolean,
  },
}
