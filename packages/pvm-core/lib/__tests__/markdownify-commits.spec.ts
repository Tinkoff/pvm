import markdownifyCommits from '../markdownify-commits'

function genCommits(subjects) {
  return subjects.map(s => {
    const delimIndex = s.indexOf('\n\n')
    const subject = delimIndex !== -1 ? s.substring(0, delimIndex) : s
    const body = delimIndex !== -1 ? s.substr(delimIndex + 1) : ''

    return {
      subject,
      body,
    }
  })
}

describe('markdownifyCommits', () => {
  it('должен корректно заменять задачки на соотв. ссылки', async () => {
    const commits = genCommits(['FB-121 сборки ускорены в 5 раз', 'а здесь нет ссылки'])
    const md = markdownifyCommits(commits, {
      jiraUrl: 'https://gitlab.com',
    })

    expect(md).toEqual(expect.stringContaining('[FB-121]'))
  })

  it('должен проставлять список обычным коммитам', () => {
    const commits = genCommits(['FB-121 сборки ускорены в 5 раз', 'а здесь нет ссылки'])
    const md = markdownifyCommits(commits, {
      jiraUrl: 'https://gitlab.com',
    })

    md.split('\n').filter(s => !!s).forEach(line => {
      expect(line).toEqual(expect.stringMatching(/^-\s/))
    })
  })
})
