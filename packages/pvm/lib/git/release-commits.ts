import type { Config, Commit } from '../../types'
import { prevReleaseTag } from './last-release-tag'
import { releaseMark } from '../consts'
import { wdShell } from '../shell'
import getCommits from './commits'

interface ReleaseCommitsOpts {
  target?: string,
  format?: string,
}

const pvmNoShowPattern = `\\[pvm noshow\\]`

export function getReleaseRefs(config: Config, target = 'HEAD'): [string, string] | void {
  const { cwd } = config

  const { no_release_ref } = config.update

  let toTarget = target
  let prevRelease = prevReleaseTag(config, target) || no_release_ref

  if (!prevRelease) {
    toTarget = target
    prevRelease = `${target}~2`

    try {
      wdShell(cwd, `git rev-parse ${prevRelease}`)
    } catch (e) {
      prevRelease = `${target}^`
    }

    try {
      wdShell(cwd, `git rev-parse ${prevRelease}`)
    } catch (e) {
      prevRelease = ''
    }
  }

  if (toTarget && prevRelease) {
    return [prevRelease, toTarget]
  }
}

export function releaseCommitsAsString(config: Config, opts: ReleaseCommitsOpts = {}): string | void {
  const { target = 'HEAD', format = '%s' } = opts

  const releaseRefs = getReleaseRefs(config, target)

  if (releaseRefs) {
    return wdShell(
      config.cwd,
      `git log ${releaseRefs[0]}..${releaseRefs[1]} --no-merges --pretty=format:${format} --grep="${releaseMark}" --grep="${pvmNoShowPattern}" --invert-grep`
    )
  }
}

export async function getReleaseCommits(config: Config, target = 'HEAD'): Promise<Commit[] | void> {
  const releaseRefs = getReleaseRefs(config, target)

  if (releaseRefs) {
    return getCommits(config.cwd, releaseRefs[0], releaseRefs[1], {
      _: [`--grep=${releaseMark}`, `--grep=${pvmNoShowPattern}`, '--invert-grep'],
    })
  }
}
