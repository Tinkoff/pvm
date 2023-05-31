async function drainItems<T>(asyncIterable: AsyncIterable<T>): Promise<T[]> {
  const items: T[] = []

  for await (const item of asyncIterable) {
    items.push(item)
  }

  return items
}

export default drainItems
