import { wdShell } from '../shell'
import path from 'path'
import fs from 'fs'

const revListCache = new Map<string, string>()

export default function revParse(ref: string, cwd: string): string {
  // converting HEAD to commit sha without starting separate process which might be slow and up to 50ms
  // https://git-scm.com/docs/gitglossary#Documentation/gitglossary.txt-aiddefsymrefasymref
  // https://git-scm.com/docs/gitrepository-layout#Documentation/gitrepository-layout.txt-HEAD
  const headPath = path.join(cwd, '.git', 'HEAD')
  if (ref === 'HEAD' && fs.existsSync(headPath)) {
    const headContent = fs.readFileSync(headPath, 'utf-8').trim()
    if (headContent) {
      // symref
      if (headContent.startsWith('ref: ')) {
        return fs.readFileSync(path.join(cwd, '.git', headContent.split('ref: ')[1]), 'utf-8').trim()
      // plain commit sha
      } else {
        return headContent
      }
    }
  }

  const cacheKey = `${cwd}_${ref}`
  const cachedResult = revListCache.get(cacheKey)
  if (ref.startsWith('HEAD') || !cachedResult) {
    const result = wdShell(cwd, `git rev-list -1 ${ref}`)

    revListCache.set(cacheKey, result)
    return result
  }

  return cachedResult
}

export function revSafeParse(ref: string, cwd: string): string | null {
  try {
    return revParse(ref, cwd)
  } catch (e) {
    return null
  }
}
