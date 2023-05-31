const isPatchRe = /^(fix|patch):/i
const isMajorRe = /^BREAKING CHANGE:/

const serviceLabelPatterns = [isPatchRe, isMajorRe]

export function stripServiceLabels(text: string): string {
  return serviceLabelPatterns.reduce((acc, labelRe) => {
    return acc.replace(labelRe, '').trim()
  }, text)
}
