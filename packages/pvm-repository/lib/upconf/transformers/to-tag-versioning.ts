import type { AnnotatedReleaseTag } from '@pvm/update/lib/release/release-context'
import { makeAnnotatedReleaseTag } from '@pvm/update/lib/release/release-context'
import { Repository } from '../../repository'

import type { Config } from '@pvm/core/lib/config/types'
import type { AppliedPkg, Pkg } from '@pvm/core/lib/pkg'
import type { VcsOnly } from '@pvm/vcs/types'

async function upconfToTagVersioning(vcs: VcsOnly, nextConfig: Config): Promise<AnnotatedReleaseTag> {
  const prevRepo = await Repository.init(vcs.cwd)
  const nextRepo = new Repository(vcs.cwd, nextConfig)
  // функция должна быть иммутабельной к vcs исходя к требованию 2 функции upconf

  const applyMap = new Map<Pkg, AppliedPkg>()
  for (const nextPkg of nextRepo.packagesMaybeWithRoot) {
    const sourcePkg = prevRepo.packagesMaybeWithRoot.get(nextPkg.name)
    if (sourcePkg) {
      applyMap.set(nextPkg, sourcePkg.applyMeta({
        ...sourcePkg.meta,
        version: sourcePkg.version,
      }))
    }
  }

  const releaseTag = await makeAnnotatedReleaseTag(nextRepo, applyMap)

  releaseTag.annotation.setBody(`Upconf migration to tag versioning from ${prevRepo.config.versioning.source}`)

  return releaseTag
}

export {
  upconfToTagVersioning,
}
