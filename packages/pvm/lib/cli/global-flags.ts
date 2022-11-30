import { env } from '../env'
import { logger } from '../logger'

type Flags = {
  dryRun: boolean,
  localMode: boolean,
}

export class GlobalFlags {
  protected flags: Flags = {
    dryRun: env.PVM_EXTERNAL_DRY_RUN === 'true',
    localMode: false,
  }

  setFlag<T extends keyof Flags>(flag: T, value: Flags[T]): void {
    logger.log(`enable global "${flag}" mode`)
    this.flags[flag] = value
  }

  getFlag<T extends keyof Flags>(flag: T): Flags[T] {
    return this.flags[flag]
  }
}
