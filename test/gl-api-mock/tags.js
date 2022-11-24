const express = require('express')
const getTags = require('../git/gl/tags')
const shell = require('../../packages/pvm/lib/shell').default
const commitsToTags = require('../git/gl/commitsToTags').default
const gitLog = require('../../packages/pvm/lib/git/log').default
const { tagNotes, setTagNotes } = require('../git/tagNotes')
const { paginate, pagingQuery } = require('../platform-mock-helpers/paging')
const repoRouterPlugin = require('../platform-mock-helpers/repo-router-plugin').default
const getGitConfigTools = require('../gitConfig')

const stats = {
  tags: {
  },
}

const router = express.Router()

repoRouterPlugin(router)

router.get('/projects/:id/repository/tags/stats', (req, res) => {
  res.json(stats.tags[req.params.id] || { reqsCount: 0 })
})

// https://docs.gitlab.com/ee/api/tags.html#list-project-repository-tags
router.get('/projects/:id/repository/tags', async (req, res, next) => {
  stats.tags[req.params.id] = stats.tags[req.params.id] || { reqsCount: 0 }
  stats.tags[req.params.id].reqsCount += 1
  try {
    const tags = await getTags(res.locals.repoDir, false)

    const pagingOpts = {
      sortMap: {
        updated: ['commit', 'created_at'],
      },
      toComparable: a => new Date(a),
    }

    res.sendPaginated(paginate(tags, pagingQuery(req.query), pagingOpts))
  } catch (e) {
    next(e)
  }
})

router.get('/projects/:id/repository/tags/:tag_name', async (req, res, next) => {
  try {
    const tags = await getTags(res.locals.repoDir, false)
    const tag = tags.find(tag => tag.name === req.params.tag_name)
    if (tag) {
      res.json(tag)
    } else {
      res.sendStatus(404)
    }
  } catch (e) {
    next(e)
  }
})

// https://docs.gitlab.com/ee/api/tags.html#create-a-new-tag
router.post('/projects/:id/repository/tags', async (req, res, next) => {
  try {
    const spawnOpts = { cwd: res.locals.repoDir }
    const gitShell = (cmd, opts = {}) => shell(cmd, Object.assign(opts, spawnOpts))
    const gitConfigTools = getGitConfigTools(gitShell)

    const { tag_name, ref, message } = req.body

    // реализуем поведение похожее на оригинальный гитлаб апи, где HEAD матчится на дефолтную ветку репы
    const gitlabLikeRef = ref === 'HEAD' ? `master` : ref

    if (message) {
      await gitConfigTools.runInPreparedEnvironment(() => gitShell(`git tag --file=- ${tag_name} ${gitlabLikeRef}`, { input: message }))
    } else {
      await gitConfigTools.runInPreparedEnvironment(() => gitShell(`git tag ${tag_name} ${gitlabLikeRef}`))
    }

    const commits = await gitLog({
      _: ['HEAD', '-n1'],
    }, spawnOpts)

    const tag = commits.reduce(commitsToTags(res.locals.repoDir), []).filter(t => t.name === tag_name)[0]

    res.json(tag)
  } catch (e) {
    next(e)
  }
})

// https://docs.gitlab.com/ee/api/releases/#create-a-release
const releaseRoute = async (req, res, next) => {
  try {
    const currentRelease = tagNotes(res.locals.repoDir, req.body.tag_name)
    if (currentRelease && req.method === 'POST') {
      res.sendStatus(409)
      return
    }
    await setTagNotes(res.locals.repoDir, req.body.tag_name, req.body.description)

    res.json({
      tag_name: req.body.tag_name,
      description: req.body.description,
    })
  } catch (e) {
    next(e)
  }
}

router.route('/projects/:id/releases')
  .post(releaseRoute)
  .put(releaseRoute)

module.exports = router
