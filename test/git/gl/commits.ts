import gitLog from '../../../packages/pvm/lib/git/log'
import { makeTransformer } from './transformCommit'

export default async function commits(repoDir: string, revRange = 'HEAD', opts = {}) {
  const spawnOpts = { cwd: repoDir }

  const commits = await gitLog({
    _: [revRange],
    oneline: true,
    reverse: true,
    ...opts,
  }, spawnOpts)
  const { transform, incDate } = makeTransformer()

  return commits.map(c => {
    incDate()
    return transform(c)
  })
}
