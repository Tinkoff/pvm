import { wdShell } from '../shell'

const revListCache = new Map<string, string>()

export default function revParse(ref: string, cwd: string): string {
  const cacheKey = `${cwd}_${ref}`
  // HEAD не кешируем
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
