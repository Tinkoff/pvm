const path = require('path')
const Configstore = require('configstore')

const stores = new Map()

const defaults = {
  mr_approvals: {
    id: 1,
    iid: 1,
    title: 'mock pr',
    description: '',
    state: 'active',
    approvers_ids: [1],
    approvals_required: 1,
    approvals_left: 1,
    approved_by: [],
    approver_groups: [],
  },
  project_approvals: {
    approvers_ids: [1],
    approver_groups: [],
    approvals_before_merge: 1,
    reset_approvals_on_push: true,
    disable_overriding_approvers_per_merge_request: false,
    merge_requests_author_approval: false,
  },
}

function dataFor(dir) {
  if (!stores.has(dir)) {
    const store = new Configstore(dir, defaults, {
      configPath: path.join(dir, '.git/gl/data.json'),
    })
    stores.set(dir, store)
  }
  return stores.get(dir)
}

exports.dataFor = dataFor
