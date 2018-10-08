async function takeFirst<T>(asyncIterator: AsyncIterable<T>): Promise<T | void> {
  for await (const item of asyncIterator) {
    return item
  }
}

export default takeFirst
