import resolveFrom from 'resolve-from'
import { requireDefault } from '../../lib/interop'

function resolveWords(maybeWords: string[] | string): string[] {
  if (Array.isArray(maybeWords)) {
    return maybeWords
  }

  for (const fromDir of [process.cwd(), __dirname]) {
    const path = resolveFrom.silent(fromDir, maybeWords)
    if (path) {
      return requireDefault(path)
    }
  }

  throw new Error(`Couldn't resolve ${maybeWords}`)
}

export default resolveWords
