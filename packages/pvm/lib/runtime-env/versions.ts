import { cwdShell } from '../shell'

const semverRe = /\d+\.\d+\.\d+/

export function makeSemverGetter(cmd: string): () => string | undefined {
  let versionCached

  return () => {
    if (!versionCached) {
      const versionMatch = cwdShell(cmd).match(semverRe)
      if (versionMatch) {
        versionCached = versionMatch[0]
      }
    }
    return versionCached
  }
}

export const getGitVersion = makeSemverGetter('git --version')
export const getNpmVersion = makeSemverGetter('npm --version')
