import { wdShell } from '../shell'
import type { Config } from '../config'

function getPreviousRefForFirstRelease(config: Config, targetRef: string): string {
  const { no_release_ref } = config.update
  if (no_release_ref && wdShell(config.cwd, `git rev-list --count ${no_release_ref}..${targetRef}`) !== '0') {
    return no_release_ref
  }
  return wdShell(config.cwd, `git rev-parse ${targetRef}^`)
}

export default getPreviousRefForFirstRelease
