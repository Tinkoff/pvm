import padLines from './text/pad-lines'
import { issueToMdLink } from './text/jira'
import { stripServiceLabels } from './text/commits'

import type { Commit } from '@pvm/types'

function fixBody(body: string): string {
  // больше чем две пустые строки заставляют markdown оборвать контекст элемента списка
  return body.replace(/\n(?:\s*\n){2,}/gm, '\n\n')
}

function markdownifyCommits(commits: Commit[], opts: Record<string, any> = {}): string {
  const {
    // какие коммиты выкидываем
    ignorePatterns = [
      '/^release:/i',
    ],
    // Нужно ли вырезать служебные пометки вида `fix:`, `patch:` или `BREAKING CHANGE:`
    stripAnnotations = true,
    // символ или строка для создания списка в релизных нотах
    listSymbol = '-',
    // Не включать в релиз-нотес тело коммитов, оставляя только subject
    skipBody = false,
    jiraUrl,
  } = opts || {}

  const doList = commits.length > 1

  return commits.reduce((acc, commit) => {
    const needIgnore = ignorePatterns.some(ignoreReStr => {
      const ignoreRe = eval(ignoreReStr) // eslint-disable-line no-eval

      return ignoreRe.test(commit.subject)
    })
    if (needIgnore) {
      return acc
    }
    const titlePrefix = doList ? `${listSymbol} ` : ''

    // @TODO: вынести в пайплайн
    let title = commit.subject

    if (jiraUrl) {
      title = issueToMdLink(jiraUrl, title)
    }
    if (stripAnnotations) {
      title = stripServiceLabels(title)
    }

    acc += `${titlePrefix}${title}\n`
    if (commit.body && !skipBody) {
      const preparedBody = jiraUrl ? fixBody(issueToMdLink(jiraUrl, commit.body)) : fixBody(commit.body)
      acc += doList ? padLines(preparedBody, 2) : `\n${preparedBody}`
      if (!acc.endsWith('\n')) {
        acc += '\n'
      }
    }

    return acc
  }, '')
}

export default markdownifyCommits
