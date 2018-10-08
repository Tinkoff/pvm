import padLines from './pad-lines'

export function cutText(text: string, maxLen: number): string {
  return text.length <= maxLen ? text : `${text.substr(0, maxLen - 2)}..<cut>`
}

export function nthIndex(str: string, pattern: string, n: number): number {
  const strLen = str.length
  let i = -1
  while (n-- && i++ < strLen) {
    i = str.indexOf(pattern, i)
    if (i < 0) {
      break
    }
  }
  return n === -1 ? i : -1
}

export {
  padLines,
}
