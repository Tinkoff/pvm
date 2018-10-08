const assert = require('assert')
const path = require('path')
const fs = require('fs')
const __unsafe_shell = require('../../packages/pvm-core/lib/shell').cwdShell
const getGitConfigTools = require('../gitConfig')

function addCommit(repoDir, commit) {
  const gitShell = (cmd, opts = {}) => __unsafe_shell(cmd, { ...opts, cwd: repoDir })

  const isFileInitiallyExists = (filePath) => {
    try {
      gitShell(`git cat-file -e HEAD:"${filePath}"`)
      return true
    } catch (e) {
      return false
    }
  }

  const {
    commit_message,
    branch = 'master',
    actions = [],
  } = commit

  const {
    start_branch = branch,
  } = commit
  assert.ok(commit_message, 'commit message is empty')

  assert.ok(gitShell(`git rev-parse --verify ${start_branch}`), `start_branch ${start_branch} should exists`)
  gitShell(`git rev-parse --verify ${branch} && git checkout -q ${branch} || git checkout -b ${branch} ${start_branch}`)

  assert.ok(actions.length, 'actions is empty')

  // https://docs.gitlab.com/ee/api/commits.html#create-a-commit-with-multiple-files-and-actions
  actions.forEach(act => {
    const {
      previous_path,
      file_path,
      action,
      content,
    } = act
    if (file_path.startsWith('/')) {
      throw new Error(`path ${file_path} is absolute. Use relative paths from repository root.`)
    }
    const targetPath = path.join(repoDir, file_path)
    const targetDir = path.dirname(targetPath)
    if (targetDir !== repoDir) {
      __unsafe_shell(`"mkdir" -p ${targetDir}`)
    }
    if (action === 'create') {
      assert(!isFileInitiallyExists(file_path), `${file_path} already exists`)
      fs.writeFileSync(targetPath, content.toString())
    } else if (action === 'delete') {
      assert(isFileInitiallyExists(file_path), `${file_path} doesn't exist`)
      gitShell(`git rm ${file_path}`)
    } else if (action === 'update') {
      assert(isFileInitiallyExists(file_path), `${file_path} doesn't exist`)
      fs.writeFileSync(targetPath, content.toString())
    } else if (action === 'move') {
      assert(previous_path, `previous_path field should exists`)
      gitShell(`git mv ${previous_path} ${file_path}`)
      if (content) {
        fs.writeFileSync(targetPath, content.toString())
      }
    } else {
      throw new Error(`unknown change type ${action}`)
    }

    if (action === 'create' || action === 'update') {
      gitShell(`git add ${file_path}`)
    }
  })

  gitShell(`git commit -F -`, { input: commit_message })
  const sha = gitShell('git rev-parse HEAD')

  assert.ok(sha, 'HEAD is empty')

  return {
    id: sha,
  }
}

module.exports = async (repoDir, commit) => {
  const gitShell = (cmd, opts = {}) => __unsafe_shell(cmd, { ...opts, cwd: repoDir })
  const gitConfigTools = getGitConfigTools(gitShell)
  return gitConfigTools.runInPreparedEnvironment(() => addCommit(repoDir, commit))
}
