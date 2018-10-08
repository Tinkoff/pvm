export function mema<A extends Array<any>, R>(fn: (...args: A) => R, arg = 0): (...args: A) => R {
  const memo = new Map<any, R>()
  return (...args: A): R => {
    const memoKey = args[arg]
    if (!memo.has(memoKey)) {
      memo.set(memoKey, fn(...args))
    }
    return memo.get(memoKey)!
  }
}
