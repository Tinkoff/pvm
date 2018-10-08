import type { Pkg } from '@pvm/core/lib/pkg'

async function * pprint(pkgIterator: AsyncIterable<Pkg>, format = '%p'): AsyncIterableIterator<string> {
  for await (const pkg of pkgIterator) {
    const data = {
      p: pkg.path,
      n: pkg.name,
      s: pkg.shortName,
      v: pkg.version,
    }

    yield format.replace(/%([pnsv])/g, (_, m) => {
      return data[m]
    })
  }
}

export default pprint
