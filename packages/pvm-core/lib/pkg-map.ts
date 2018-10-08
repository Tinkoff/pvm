import { loggerFor } from './logger'
import { handleDifferentComparisonRefs } from './utils'

import type { Pkg as PkgType } from './pkg'

const logger = loggerFor('pvm:core')

export class PkgMap<Value, Pkg extends PkgType = PkgType> implements Iterable<[PkgType, Value]> {
  protected _map: Map<string, [Pkg, Value]>

  constructor() {
    this._map = new Map()
  }

  set(pkg: Pkg, value: Value): void {
    const res = this._map.get(pkg.name)
    if (res && res[0].ref !== pkg.ref) {
      handleDifferentComparisonRefs(logger, res[0], pkg)
    }

    this._map.set(pkg.name, [pkg, value])
  }

  get(pkgOrName: Pkg | string): Value | undefined {
    if (typeof pkgOrName === 'string') {
      return this._map.get(pkgOrName)?.[1]
    }

    const res = this._map.get(pkgOrName.name)
    if (!res) {
      return
    }

    const [storedPkg, value] = res
    if (storedPkg !== pkgOrName) {
      handleDifferentComparisonRefs(logger, storedPkg, pkgOrName)
    }

    return value
  }

  keys(): IterableIterator<string> {
    return this._map.keys()
  }

  has(pkgOrName: Pkg | string): boolean {
    return !!this.get(pkgOrName)
  }

  get size(): number {
    return this._map.size
  }

  [Symbol.iterator]() {
    return this._map.values()
  }
}
