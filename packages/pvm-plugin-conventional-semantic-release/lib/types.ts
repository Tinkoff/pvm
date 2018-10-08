import type { PvmReleaseType } from '@pvm/core/types'

export type Options = {
  releaseRules?: Array<{
    type: string,
    breaking: boolean,
    revert: boolean,
    emoji: string,
    tag: string,
    component: string,
    release: PvmReleaseType,
  }>,
}
