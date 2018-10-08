export function cmpStr(a: string, b: string): number {
  if (a > b) {
    return 1
  } else if (a < b) {
    return -1
  }
  return 0
}

export function gracefullyTruncateText(text: string, maxLen: number, suffix = '\n...'): string {
  if (text.length > maxLen) {
    const maxText = text.slice(
      0,
      maxLen - suffix.length
    )
    const maxMeaningfulText = maxText.slice(0, maxText.lastIndexOf('\n'))
    return `${maxMeaningfulText}${suffix}`
  }

  return text
}
