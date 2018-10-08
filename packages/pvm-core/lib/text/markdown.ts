
export const mrkdwnLinkRe = /\[([^\]]+)\]\(([^)]+)\)/g

export function pullOutLinks(text: string): string {
  return text.replace(mrkdwnLinkRe, (_, _subj, link) => {
    return link
  })
}

export function replaceLinks(text: string, replacer): string {
  return text.replace(mrkdwnLinkRe, replacer)
}

const escapeRe = (s) => {
  return s.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')
}

export function dottifyList(text: string, symbolItem = '-'): string {
  const listItemRe = new RegExp(`^(\\s*)${escapeRe(symbolItem)}\\s`, 'gm')
  return text.replace(listItemRe, (_, ident) => {
    return ident + '• '
  })
}
