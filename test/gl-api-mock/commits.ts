import express from 'express'
import addCommit from '../git/addCommit'
import getCommits from '../git/gl/commits'
import { paginate, pagingQuery } from '../platform-mock-helpers/paging'
import repoRouterPlugin from '../platform-mock-helpers/repo-router-plugin'

const router = express.Router()

repoRouterPlugin(router)

router.get('/projects/:id/repository/commits', async (req, res, next) => {
  try {
    const commits = await getCommits(res.app.locals.repoDir, req.query.ref_name as string)

    const pagingOpts = {
      sortMap: {
        updated: ['created_at'],
      },
      toComparable: (a: any) => new Date(a),
    }

    res.app.locals.sendPaginated(paginate(commits, pagingQuery(req.query), pagingOpts))
  } catch (e) {
    next(e)
  }
})

// https://docs.gitlab.com/ee/api/commits.html#create-a-commit-with-multiple-files-and-actions
router.post('/projects/:id/repository/commits', async (req, res, next) => {
  try {
    const commit = await addCommit(res.app.locals.repoDir, req.body)

    res.json(commit)
  } catch (e) {
    next(e)
  }
})

export default router
