const express = require('express')
const repoRouterPlugin = require('../platform-mock-helpers/repo-router-plugin').default
const { users } = require('../fixtures/users')

const router = express.Router()
repoRouterPlugin(router)

router.get('/projects/:id/merge_requests', (req, res) => {
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

router.get('/users', (req, res) => {
  const { username } = req.query

  let response = users
  if (username) {
    response = users.filter(u => u.username === username)
  }

  res.json(response)
})

module.exports = router
