export const issueRe = /[A-Z]{2,}-\d+/g

export function issueToMdLink(jiraUrl: string, text: string): string {
  return text.replace(issueRe, m => {
    return `[${m}](${jiraUrl}/browse/${m})`
  })
}

export function issueToLink(jiraUrl: string, text: string): string {
  return text.replace(issueRe, m => {
    return `${jiraUrl}/browse/${m}`
  })
}

export function issueToSlackLink(jiraUrl: string, text: string): string {
  return text.replace(issueRe, m => {
    return `<${jiraUrl}/browse/${m}|${m}>`
  })
}
