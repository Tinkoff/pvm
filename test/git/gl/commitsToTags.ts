import { makeTransformer } from './transformCommit'

import { tagNotes } from '../tagNotes'
import type { Commit } from '@pvm/pvm'
import { shell } from '@pvm/pvm'
import type { GitlabCommit } from '../../types'

const makeReducer = (cwd: string, opts: { onlyReleases?: boolean } = {}) => {
  const gitShell = (cmd: string) => shell(cmd, { cwd })

  const { incDate, transform } = makeTransformer()

  return (acc: Array<{
    name: string,
    message: string,
    target: string,
    commit: GitlabCommit,
    release: { tag_name: string, description: string } | null,
  }>, c: Commit) => {
    const sha = c.commit.long
    const tagNames = gitShell(`git tag --points-at ${sha}`).split(/\s+/).filter(s => s.length > 0)
    if (!tagNames.length) {
      return acc
      // throw new Error(`commit ${sha} doesn't point to tag`)
    }
    incDate()

    tagNames.forEach(tagName => {
      const mayByTagMessage = gitShell(`git cat-file -p ${tagName} | tail -n +6`)
      const tagCommit = gitShell(`git log --pretty=format:%s -n1 ${tagName}`)
      const releaseNotes = tagNotes(cwd, tagName)

      const tagMessage = mayByTagMessage === tagCommit ? '' : mayByTagMessage

      if (!releaseNotes && opts.onlyReleases) {
        return acc
      }

      // сейчас функция tagNotes не делает различий между пустым релизом и его отсутствием
      // поэтому считаем что если вернулась пустая строка значит релиза нет

      let release: { tag_name: string, description: string } | null = null
      if (releaseNotes) {
        release = {
          tag_name: tagName,
          description: releaseNotes,
        }
      }

      acc.push({
        name: tagName,
        message: tagMessage,
        target: sha,
        commit: transform(c),
        release,
      })
    })

    return acc
  }
}

export default makeReducer
