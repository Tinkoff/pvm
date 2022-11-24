import { cachedRealPath } from '../fs'

export enum CacheTag {
  gitFetch,
  gitFetchTags,
  gitFetchShallow,
  gitBranches,
  pvmConfig,
}

export class CwdCache<V> {
  _caches: Map<string, Map<string, V>> = new Map()

  _cwdKey(cwd: string | undefined): string {
    return cwd ? cachedRealPath(cwd) : ''
  }

  _getCacheMap(cwd: string | undefined = void 0): Map<string, V> {
    const cwdKey = this._cwdKey(cwd)
    let cache = this._caches.get(cwdKey)
    if (!cache) {
      cache = new Map<string, V>()
      this._caches.set(cwdKey, cache)
    }
    return cache
  }

  set(cwd: string | undefined, key: unknown, value: V): void {
    const cache = this._getCacheMap(cwd)
    cache.set(JSON.stringify(key), value)
  }

  get(cwd: string | undefined, key: unknown): V | undefined {
    const cache = this._getCacheMap(cwd)
    return cache.get(JSON.stringify(key))
  }

  remove(cwd: string | undefined, key: unknown): boolean {
    const cache = this._getCacheMap(cwd)
    return cache.delete(JSON.stringify(key))
  }

  has(cwd: string | undefined, key: unknown): boolean {
    const cwdKey = this._cwdKey(cwd)
    if (!this._caches.has(cwdKey)) {
      return false
    }

    return this._caches.get(cwdKey)!.has(JSON.stringify(key))
  }

  clear(cwd: string | undefined): boolean {
    return this._caches.delete(this._cwdKey(cwd))
  }

  clearAll(): void {
    this._caches.clear()
  }
}

export interface MemoizedFunction<A extends Array<any>, R> {
  (...args: A): R,
  fn(...args: A): R,
  cache: CwdCache<R>,
}

class TaggedCacheManager {
  protected _tags: Map<CacheTag, Set<CwdCache<any>>> = new Map()

  make<V>(tags: CacheTag[]): CwdCache<V> {
    const cwdCache = new CwdCache<V>()
    for (const tag of tags) {
      this._tags.set(tag, (this._tags.get(tag) || new Set()).add(cwdCache))
    }

    return cwdCache
  }

  _splitArgsToKey(args: unknown[], cwdArgPosition: number | undefined = void 0): [string | undefined, string] {
    const cwd: string | undefined = cwdArgPosition === void 0 ? void 0 : args[cwdArgPosition] as string
    let filteredArgs = args
    if (cwdArgPosition !== void 0) {
      filteredArgs = [...args]
      filteredArgs.splice(cwdArgPosition, 1)
    }

    return [cwd, JSON.stringify(filteredArgs)]
  }

  decorate<A extends Array<any>, R>(fn: (...args: A) => R, tags: CacheTag[], cwdArgPosition: number | undefined = void 0): MemoizedFunction<A, R> {
    const caches = this.make<R>(tags)
    const wrapper = (...args: A): R => {
      const [cwdKey, cacheKey] = this._splitArgsToKey(args, cwdArgPosition)
      if (caches.has(cwdKey, cacheKey)) {
        return caches.get(cwdKey, cacheKey)!
      }
      const value = fn(...args)
      caches.set(cwdKey, cacheKey, value)
      return value
    }

    wrapper.fn = fn
    wrapper.cache = caches
    return wrapper
  }

  clearForTags(tags: CacheTag[]): void {
    for (const tag of tags) {
      for (const caches of (this._tags.get(tag) || [])) {
        caches.clearAll()
      }
    }
  }

  clear(cwd: string, tags: CacheTag[]): void {
    for (const tag of tags) {
      for (const caches of (this._tags.get(tag) || [])) {
        caches.clear(cwd)
      }
    }
  }
}

export const taggedCacheManager = new TaggedCacheManager()

export function memoize<A extends Array<any>, R>(fn: (...args: A) => R, tags: CacheTag[]): MemoizedFunction<A, R> {
  return taggedCacheManager.decorate(fn, tags)
}

export function wdmemoize<A extends Array<any>, R>(fn: (...args: A) => R, tags: CacheTag[], cwdArgPosition = 0): MemoizedFunction<A, R> {
  return taggedCacheManager.decorate(fn, tags, cwdArgPosition)
}
