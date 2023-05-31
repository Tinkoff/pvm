import { replaceLinks, dottifyList } from '@pvm/pvm'

export function processMarkdown(text: string): string {
  return replaceLinks(text, (_, subj, link) => {
    return `<${link}|${subj}>`
  })
}

interface PrepareTextOptions {
  dottifyList?: boolean | string,
}

export function formatText(text: string, opts: PrepareTextOptions = {}): string {
  const { dottifyList: dottifyListParam } = opts
  text = processMarkdown(text)
  if (dottifyListParam) {
    const listSymbol = typeof dottifyListParam === 'string' ? dottifyListParam : '-'
    text = dottifyList(text, listSymbol)
  }
  return text
}
