
export function * reverseIterator<T>(items: T[]): IterableIterator<T> {
  let i = items.length - 1

  while (i >= 0) {
    yield items[i]
    i--
  }
}

export function selectWithPassion<T>(items: Iterable<T>, sample: Iterable<T>, howMany: number): T[] {
  const sampleSet = new Set<T>(sample)
  const sortedItems = Array.from(items).sort((a, b) => {
    const aIn = sampleSet.has(a)
    const bIn = sampleSet.has(b)
    if (aIn === bIn) {
      return 0
    }

    if (aIn && !bIn) {
      return -1
    }
    return 1
  })

  return sortedItems.slice(0, howMany)
}
