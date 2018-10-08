import { pkgset } from '@pvm/pkgset'
import glob from 'fast-glob'
import drainItems from '@pvm/core/lib/iter/drain-items'
import type { Pkg } from '@pvm/core/lib/pkg'
import { getWorkspacesSync } from '@pvm/core/lib/workspaces'
import isRootChanged from '@pvm/pkgset/lib/is-root-changed'
import path from 'path'

function normalizePath(p: string): string {
  return p.replace(/\\/g, '/')
}

export default async function getFiles(filesGlob: string | string[], opts: Record<string, any>): Promise<string[]> {
  const { cwd = process.cwd(), absolute, strategy, ...rest } = opts
  const workspaces = getWorkspacesSync(cwd).sort()
  const pkgs = await drainItems<Pkg>(pkgset(strategy, { cwd, ...rest }))
  const pkgsWithoutRoot = pkgs.filter(pkg => pkg.path !== '.')
  const rootIsTouched = pkgsWithoutRoot.length !== pkgs.length
  const files = glob.sync(filesGlob, {
    absolute: false,
    cwd,
    onlyFiles: true,
    ignore: ['**/node_modules/**'],
  })

  const resFiles = files.filter(f => {
    if (pkgsWithoutRoot.some(pkg => f.startsWith(normalizePath(`${pkg.path}/`)))) {
      return true
    }

    if (rootIsTouched) {
      return isRootChanged(workspaces, [f])
    }
    return false
  })
  return absolute ? resFiles.map(f => normalizePath(path.join(cwd, f))) : resFiles
}
