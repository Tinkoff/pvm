const { Octokit } = require('octokit')

const GITHUB_TEST_OWNER = 'pvm-test-bot'

const githubClient = new Octokit({
  auth: process.env.PVM_GITHUB_TEST_REPO_TOKEN,
})

const reposIter = githubClient.paginate.iterator('GET /users/{username}/repos', {
  username: GITHUB_TEST_OWNER,
})

const CURRENT_TIME = new Date().valueOf()
const MAX_REPO_LIFETIME_IN_MINUTES = 2
async function run() {
  for await (const repos of reposIter) {
    for (const repo of repos.data) {
      const creationTime = new Date(repo.created_at).valueOf()
      // if repo created more than 2min ago then assume that it is not needed anymore
      const repoLifetime = Math.round((CURRENT_TIME - creationTime) / (60 * 1000))
      if (repoLifetime > MAX_REPO_LIFETIME_IN_MINUTES) {
        console.log(`Repo ${repo.name} is created ${repoLifetime} minutes ago. Deleting`)
        await githubClient.rest.repos.delete({
          owner: GITHUB_TEST_OWNER,
          repo: repo.name,
        })
      } else {
        console.log(`Repo ${repo.name} is created ${repoLifetime} minutes ago. Retaining`)
      }
    }
  }
}

run()
  .catch((e) => {
    console.error(e)
    process.exitCode = 1
  })
