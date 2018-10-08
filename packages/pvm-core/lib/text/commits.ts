import { tags as serviceLabelPatterns } from '../analyzer/simple'

export function stripServiceLabels(text: string): string {
  return serviceLabelPatterns.reduce((acc, labelRe) => {
    return acc.replace(labelRe, '').trim()
  }, text)
}
