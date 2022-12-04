import reduceToTags from './commitsToTags'
import gitLog from '../../../packages/pvm/lib/git/log'

export async function getTags(repoDir: string, onlyReleases = true) {
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
