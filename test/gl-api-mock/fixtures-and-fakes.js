const express = require('express')
const repoRouterPlugin = require('../platform-mock-helpers/repo-router-plugin').default
const { users } = require('../fixtures/users')

const router = express.Router()
repoRouterPlugin(router)

router.get('/projects/:id/merge_requests', (req, res) => {
  if (req.params.id === 'WITHOUT_MR') {
    res.status(404)
    res.send({})
    return
  }

  res.json([
    {
      id: 1,
      iid: 1,
      title: 'Mock PR',
      description: '',
      author: {
        id: 777,
        username: 'pushkin',
        name: 'Alexander Pushkin',
      },
    },
  ])
})

// https://docs.gitlab.com/ee/api/commits.html#list-merge-requests-associated-with-a-commit
router.get('/projects/:projectId/repository/commits/:id/merge_requests', async (req, res, next) => {
  res.json([
    {
      id: 1,
      iid: 1,
      title: 'Mock PR',
      target_branch: 'master',
      author: {
        id: 777,
        username: 'pushkin',
        name: 'Alexander Pushkin',
      },
      ...this.mergeRequestForCommit?.[req.params.id],
    },
  ])
  delete this.mergeRequestForCommit?.[req.params.id]
})

router.post('/merge-request-for-commit/:commitId', (req, res) => {
  this.mergeRequestForCommit = this.mergeRequestForCommit || {}
  this.mergeRequestForCommit[req.params.commitId] = req.body
  res.status(200)
  res.send()
})

router.get('/users', (req, res) => {
  const { username } = req.query

  let response = users
  if (username) {
    response = users.filter(u => u.username === username)
  }

  res.json(response)
})

module.exports = router
