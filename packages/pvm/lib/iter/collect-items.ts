
export async function collectItemsToRecord<T>(asyncIterator: AsyncIterable<T>, key: (x: T) => string): Promise<Record<string, T>> {
  const items = Object.create(null)

  for await (const item of asyncIterator) {
    items[key(item)] = item
  }

  return items
}
