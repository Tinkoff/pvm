const express = require('express')
const addCommit = require('../git/addCommit')
const getCommits = require('../git/gl/commits')
const { paginate, pagingQuery } = require('../platform-mock-helpers/paging')
const repoRouterPlugin = require('../platform-mock-helpers/repo-router-plugin').default

const router = express.Router()

repoRouterPlugin(router)

router.get('/projects/:id/repository/commits', async (req, res, next) => {
  try {
    const commits = await getCommits(res.locals.repoDir, req.query.ref_name)

    const pagingOpts = {
      sortMap: {
        updated: ['created_at'],
      },
      toComparable: a => new Date(a),
    }

    res.sendPaginated(paginate(commits, pagingQuery(req.query), pagingOpts))
  } catch (e) {
    next(e)
  }
})

// https://docs.gitlab.com/ee/api/commits.html#create-a-commit-with-multiple-files-and-actions
router.post('/projects/:id/repository/commits', async (req, res, next) => {
  try {
    const commit = await addCommit(res.locals.repoDir, req.body)

    res.json(commit)
  } catch (e) {
    next(e)
  }
})

module.exports = router
