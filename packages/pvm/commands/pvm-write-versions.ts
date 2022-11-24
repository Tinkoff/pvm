#!/usr/bin/env node
import { setVersions } from '../mechanics/set-versions'

export const command = 'write-versions'
export const description = `Replace stub versions in package.json's with actual one's from versions file or from release tag. Alias for 'pvm set-versions none -u -s all'`
export const handler = function(): Promise<void> {
  return setVersions({
    strategy: 'all',
    versionOrReleaseType: 'none',
    bumpDependants: false,
    filterPath: [],
    strategyOption: [],
    updateDependants: true,
  })
}
