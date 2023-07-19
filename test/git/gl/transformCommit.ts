import type { Commit } from '@pvm/pvm'
import type { GitlabCommit } from '../../types'

const addSeconds = require('date-fns/addSeconds')

// берем коммит от git-log-parser и преобразовываем в формат коммита гитлаба
const transform = (c: Commit, processDate: (d: Date) => string): GitlabCommit => {
  const sha = c.commit.long
  return {
    id: sha,
    short_id: c.commit.short,
    title: c.subject,
    created_at: processDate(c.committer.date),
    message: [c.subject, c.body].filter(x => !!x).join('\n\n'),
    author_name: c.author.name,
    author_email: c.author.email,
    author_date: processDate(c.author.date),
    committer_name: c.committer.name,
    committer_email: c.committer.email,
    committer_date: processDate(c.committer.date),
  }
}

export function makeTransformer() {
  let i = 0

  const baseDate = new Date('2018-11-27T12:00:00.000Z')

  const fakeDate = () => {
    return addSeconds(baseDate, i).toISOString()
  }

  return {
    incDate() {
      i++
    },
    transform(c: Commit) {
      return transform(c, fakeDate)
    },
  }
}
