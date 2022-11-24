const reduceToTags = require('./commitsToTags').default
const gitLog = require('../../../packages/pvm/lib/git/log').default

async function gitTags(repoDir, onlyReleases = true) {
  const spawnOpts = { cwd: repoDir }
  // --tags --decorate=short --simplify-by-decoration --oneline --reverse
  const commits = await gitLog({
    'decorate': 'short',
    tags: true,
    reverse: true,
    oneline: true,
    'simplify-by-decoration': true,
  }, spawnOpts)
  return commits.reduce(reduceToTags(repoDir, {
    onlyReleases,
  }), [])
}

module.exports = gitTags
