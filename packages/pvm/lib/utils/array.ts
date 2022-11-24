export function expDropRight<T>(list: T[], filterFn: (entry: T, index: number) => boolean): T[] {
  let sliceTo: number | null = null

  let jumpFrom = list.length
  let successJumps = 0
  for (let i = jumpFrom - 1; i >= 0;) {
    if (filterFn(list[i], i)) {
      if (i !== jumpFrom - 1) {
        i = jumpFrom - 1
        successJumps = 0
        continue
      } else {
        break
      }
    } else {
      successJumps += 1
    }
    sliceTo = i
    jumpFrom = i
    const step = Math.min(Math.floor(Math.exp(successJumps)), i)
    if (step !== 0) {
      i -= step
    } else {
      break
    }
  }

  if (sliceTo !== null) {
    return list.slice(0, sliceTo)
  }
  return list
}
