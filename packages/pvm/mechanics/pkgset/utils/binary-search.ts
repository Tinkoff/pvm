
function binarySearch<T = any>(array: Array<T>, pred: (x: T) => boolean, isMoreThan: (x: T) => boolean): number | -1 {
  let guess
  let min = 0
  let max = array.length - 1

  while (min <= max) {
    guess = (min + max) >> 1
    if (pred(array[guess])) {
      return guess
    } else if (isMoreThan(array[guess])) {
      min = guess + 1
    } else {
      max = guess - 1
    }
  }

  return -1
}
export default binarySearch
