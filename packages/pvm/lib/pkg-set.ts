import { loggerFor } from './logger'
import { handleDifferentComparisonRefs } from './utils'

import type { Pkg as PkgType } from './pkg'

const logger = loggerFor('pvm:core')

export class ImmutablePkgSet<Pkg extends PkgType = PkgType> implements Iterable<Pkg> {
  protected _map: Map<string, Pkg>

  constructor(packages: Iterable<Pkg> = []) {
    this._map = new Map(Array.from(packages).map(pkg => [pkg.name, pkg]))
  }

  get(pkgOrName: Pkg | string): Pkg | undefined {
    let pkgName: string
    let pkg: Pkg | undefined

    if (typeof pkgOrName === 'string') {
      pkgName = pkgOrName
    } else {
      pkgName = pkgOrName.name
      pkg = pkgOrName
    }

    const resultPkg = this._map.get(pkgName)
    if (resultPkg && pkg && resultPkg.ref !== pkg.ref) {
      handleDifferentComparisonRefs(logger, resultPkg, pkg)
    }
    return resultPkg
  }

  keys(): IterableIterator<string> {
    return this._map.keys()
  }

  has(pkgOrName: Pkg | string): boolean {
    return !!this.get(pkgOrName)
  }

  [Symbol.iterator](): IterableIterator<Pkg> {
    return this._map.values()
  }

  get size(): number {
    return this._map.size
  }

  toArray(): Pkg[] {
    return Array.from(this)
  }

  map<T>(fn: (pkg: Pkg) => T): T[] {
    return this.toArray().map(fn)
  }

  clone(): this {
    const Klass = (this.constructor || ImmutablePkgSet)
    // @ts-ignore
    return new Klass(this)
  }

  asMut(): PkgSet<Pkg> {
    return new PkgSet(this)
  }
}

export class PkgSet<Pkg extends PkgType = PkgType> extends ImmutablePkgSet<Pkg> {
  add(pkg: Pkg): this {
    this._map.set(pkg.name, pkg)
    return this
  }

  addIterable(pkgset: Iterable<Pkg>): this {
    for (const pkg of pkgset) {
      if (!this.has(pkg)) {
        this.add(pkg)
      }
    }
    return this
  }

  freeze(): ImmutablePkgSet<Pkg> {
    return new ImmutablePkgSet(this)
  }
}
