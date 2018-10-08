import micromatch from 'micromatch'
import type { Pkg } from './pkg'

export function matchPackage(pkg: Pkg, pattern: string): boolean {
  if (pattern.startsWith('/')) {
    return micromatch.isMatch(pkg.path, pattern.substr(1))
  }

  return micromatch.isMatch(pkg.name, pattern, {
    // в данном случае мы хотим матчить неймспейсы тоже
    matchBase: true,
  })
}

export function matchAny(pkg: Pkg, patterns: string[]): boolean {
  for (const pattern of patterns) {
    if (matchPackage(pkg, pattern)) {
      return true
    }
  }
  return false
}

export function matchGroup<KeyType extends string>(pkg: Pkg, groups: Partial<Record<KeyType, string | string[]>>): KeyType | undefined {
  for (const [key, pattern] of (Object.entries(groups) as [KeyType, string | string[]][])) {
    const patterns = typeof pattern === 'string' ? [pattern] : pattern

    if (matchAny(pkg, patterns)) {
      return key
    }
  }
}
