#!/usr/bin/env node
import { setVersions } from '../mechanics/set-versions'
import type { Container } from '../lib/di'
import type { CommandFactory } from '../types'

export default (di: Container): CommandFactory => builder => builder.command(
  'write-versions',
  `Replace stub versions in package.json's with actual one's from versions file or from release tag. Alias for 'pvm set-versions none -u -s all'`,
  function(): Promise<void> {
    return setVersions(di, {
      strategy: 'all',
      versionOrReleaseType: 'none',
      bumpDependants: false,
      filterPath: [],
      strategyOption: [],
      updateDependants: true,
    })
  }
)
