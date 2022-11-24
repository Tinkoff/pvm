import path from 'path'
import fs from 'fs'
import chalk from 'chalk'
import resolveFrom from 'resolve-from'
import { requireDefault } from '../interop'
import { logger } from '../logger'

export interface PvmProviderInfo {
  pkg: Record<string, any>,
  path: string,
}

const allSeenProviders = new Map<string, string[]>()

export const resolvePvmProvider = (cwd: string): PvmProviderInfo | undefined => {
  cwd = fs.realpathSync(cwd)
  const rootPkgPath = path.join(cwd, 'package.json')
  let pkg
  try {
    pkg = requireDefault(rootPkgPath)
  } catch (e) {
    return
  }
  let seenProviders = allSeenProviders.get(cwd)
  if (!seenProviders) {
    seenProviders = []
    allSeenProviders.set(cwd, seenProviders)
  }

  const deps = {
    ...(pkg.dependencies || {}),
    ...(pkg.devDependencies || {}),
  }

  for (const depName of Object.keys(deps)) {
    if (depName.indexOf('pvm') !== -1 && !depName.startsWith('@pvm/plugin') && depName.indexOf('pvm-plugin') === -1) {
      const pkgRelativePath = deps[depName].startsWith('file:') ? deps[depName].replace(/^file:/, '') : depName
      const depPkgPackagePath = resolveFrom.silent(cwd, `${pkgRelativePath}/package.json`)
      if (!depPkgPackagePath) {
        continue
      }
      const depPkg = require(depPkgPackagePath)

      if (depPkg?.pvm?.provider) {
        if (seenProviders.indexOf(depName) === -1) {
          logger.info(chalk`Load pvm provider {blue ${depName}}`)
          seenProviders.push(depName)
          allSeenProviders.set(cwd, seenProviders)
        }

        return {
          pkg: depPkg,
          path: path.dirname(depPkgPackagePath),
        }
      }
    }
  }
}
