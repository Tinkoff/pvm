const cacheKey = Symbol.for('_cached_props')

// eslint-disable-next-line @typescript-eslint/ban-types
export function lazyCallee(targetProto: object, propKey: string, desc: PropertyDescriptor): void {
  const descKey: 'get' | 'value' = desc.get ? 'get' : 'value'
  const getter = desc[descKey]
  if (typeof getter !== 'function') {
    throw new TypeError(`lazyCallee applied on non-function property ${propKey}`)
  }
  targetProto[`_lazyReset_${propKey}`] = function() {
    const cacheMap: Map<string, any> = this[cacheKey]
    if (cacheMap) {
      cacheMap.delete(propKey)
    }
  }

  desc[descKey] = function(...args) {
    if (args.length !== 0) {
      throw new Error(`lazyCallee can't operate on function with arguments`)
    }
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const self: any = this
    let cacheMap = self[cacheKey]
    if (!cacheMap) {
      cacheMap = new Map<string, any>()
      self[cacheKey] = cacheMap
    }
    if (!cacheMap.has(propKey)) {
      cacheMap.set(propKey, getter.call(self))
    }
    return cacheMap.get(propKey)
  }
}
