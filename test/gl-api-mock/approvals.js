const express = require('express')
const repoRouterPlugin = require('../platform-mock-helpers/repo-router-plugin').default
const { mapUsers } = require('../fixtures/users')

const router = express.Router()
repoRouterPlugin(router)

router.get('/projects/:id/approvals', async (req, res, next) => {
  try {
    const approvals = req.repoData.get('project_approvals')
    approvals.approvers = mapUsers(approvals.approvers_ids)
    res.json(approvals)
  } catch (e) {
    next(e)
  }
})

// https://docs.gitlab.com/ee/api/merge_request_approvals.html#get-configuration-1
router.get('/projects/:id/merge_requests/:merge_request_iid/approvals', async (req, res, next) => {
  try {
    const approvals = req.repoData.get('mr_approvals')
    approvals.approvers = mapUsers(approvals.approvers_ids)
    res.json(approvals)
  } catch (e) {
    next(e)
  }
})

// https://docs.gitlab.com/ee/api/merge_request_approvals.html#change-approval-configuration
router.post('/projects/:id/merge_requests/:merge_request_iid/approvals', async (req, res, next) => {
  try {
    const { approvals_required } = req.body
    req.repoData.set('mr_approvals.approvals_required', approvals_required)
    res.json(req.repoData.get('mr_approvals'))
  } catch (e) {
    next(e)
  }
})

// https://docs.gitlab.com/ee/api/merge_request_approvals.html#change-allowed-approvers-for-merge-request
router.put('/projects/:id/merge_requests/:merge_request_iid/approvers', async (req, res, next) => {
  try {
    const { approver_ids } = req.body
    req.repoData.set('mr_approvals.approvers_ids', approver_ids)
    res.json(req.repoData.get('mr_approvals'))
  } catch (e) {
    next(e)
  }
})

module.exports = router
