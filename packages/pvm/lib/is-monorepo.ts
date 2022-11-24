import fs from 'fs'
import path from 'path'
import { mema } from './memoize'

function isMonorepo(targetDir: string = process.cwd()): boolean {
  const pkgPath = path.join(targetDir, 'package.json')
  if (fs.existsSync(pkgPath)) {
    const pkg = JSON.parse(fs.readFileSync(pkgPath, { encoding: 'utf8' }))
    return !!pkg.workspaces
  }
  return false
}

export default mema(isMonorepo)
