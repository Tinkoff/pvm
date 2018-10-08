const gitLog = require('@pvm/core/lib/git/log').default
const makeTransormer = require('./transformCommit')

async function commits(repoDir, revRange = 'HEAD', opts = {}) {
  const spawnOpts = { cwd: repoDir }

  const commits = await gitLog({
    _: [revRange],
    oneline: true,
    reverse: true,
    ...opts,
  }, spawnOpts)
  const { transform, incDate } = makeTransormer()

  return commits.map(c => {
    incDate()
    return transform(c)
  })
}

module.exports = commits
