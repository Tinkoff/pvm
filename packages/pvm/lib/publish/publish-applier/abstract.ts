import type { AppliedPkg, Pkg } from '@pvm/core/lib/pkg'
import { loadPkg } from '@pvm/core/lib/pkg'
import { isStubVersion } from '@pvm/core/lib/tag-meta'
import type { Repository } from '@pvm/repository'

function lowerCaseSentence(sentence: string): string {
  return sentence.charAt(0).toLowerCase() + sentence.substr(1)
}

export abstract class AbstractPublishApplier {
  repo: Repository

  constructor(repo: Repository) {
    this.repo = repo
  }

  abstract getPkgPublishVersion(pkg: Pkg): Promise<string>;

  async applyActualDeps(pkg: Pkg): Promise<AppliedPkg> {
    const deps = pkg.deps
    const newDeps: Map<string, string> = new Map()
    for (const depName of Object.keys(deps)) {
      const depPkg = this.repo.pkgset.get(depName)
      if (depPkg) {
        newDeps.set(depName, await this.getPkgPublishVersion(depPkg))
      }
    }
    if (newDeps.size) {
      return pkg.applyNewDeps(newDeps)
    }
    return pkg.toApplied()
  }

  async applyForPublish(pkg: Pkg): Promise<AppliedPkg> {
    const { config } = this.repo
    const publishPkg = loadPkg(config, pkg.publishPath, { sourcePath: pkg.sourcePath, cwd: this.repo.cwd, ref: undefined /* собранный пакет не закоммичен. Нужно читать из fs */ })
    if (!publishPkg) {
      throw new Error(`Unable to load package ${pkg.name} from publish path ${pkg.publishPath}`)
    }

    if (isStubVersion(pkg.version)) {
      let howToFix = ''
      const howToFixMap = {
        tag: 'Make sure you have valid semver tag in repository or create one via "git tag v1.0.0" command for example.',
        file: 'You can save real package versions to the separate file and reset versions via "yarn pvm lint --fix" command.',
      }
      if (config.versioning.source !== 'package') {
        howToFix = howToFixMap[config.versioning.source]
      } else {
        howToFix = [
          `You have "versioning.source" = "package". Try change it to "file" or "tag". In case of "file" ${lowerCaseSentence(howToFixMap.file)}`,
          `In case of "tag" ${lowerCaseSentence(howToFixMap.tag)}`,
        ].join('\n')
      }
      throw new Error(`You are trying publish package ${pkg.name} with version ${pkg.version}, but ${pkg.version} is placeholder version!\n${howToFix}`)
    }

    let appliedPkg = publishPkg.applyVersion(await this.getPkgPublishVersion(publishPkg))
    if (config.versioning.source !== 'package') {
      // в случае если в пакете не хранятся реальные версии, то нам кроме версии, которую мы применили выше
      // нужно проставить все зависимости на реальные
      appliedPkg = await this.applyActualDeps(appliedPkg)
    }

    return appliedPkg
  }
}
