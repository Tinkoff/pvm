import { GithubPlatform } from '../platform'
import initRepo from '../../../test/initRepo'
import { env, GLOBAL_FLAGS_TOKEN, HOST_API_TOKEN } from '@pvm/pvm'
import { randomUUID } from 'crypto'
import { Octokit } from 'octokit'

const GITHUB_TEST_OWNER = 'pvm-test-bot'
const API_ATTEMPTS_TIME_LIMIT = 15e3
const API_ATTEMPT_THROTTLE = 300
const RETRY_CONTINUE = 'RETRY_CONTINUE'

jest.setTimeout(25000)
jest.retryTimes(2)

const githubClient = new Octokit({
  auth: env.PVM_GITHUB_TEST_REPO_TOKEN,
});

(env.PVM_GITHUB_TEST_REPO_TOKEN ? describe : describe.skip)('pvm-github', () => {
  beforeAll(() => {
    // eslint-disable-next-line pvm/no-process-env
    process.env.GITHUB_TOKEN = process.env.PVM_GITHUB_TEST_REPO_TOKEN
  })

  afterAll(() => {
    // eslint-disable-next-line pvm/no-process-env
    process.env.GITHUB_TOKEN = undefined
  })

  describe('releases and tags', () => {
    it('addTag', async () => {
      const { repoName, headCommit, githubPlatform } = await prepareRepository()
      await githubPlatform.addTag(headCommit, 'test')
      const { data: tags } = await githubClient.rest.repos.listTags({
        repo: repoName,
        owner: GITHUB_TEST_OWNER,
      })
      expect(tags[0].name).toEqual('test')
    })

    it('addTagAndRelease', async () => {
      const { repoName, headCommit, githubPlatform } = await prepareRepository()
      const { id: releaseId } = await githubPlatform.addTagAndRelease(headCommit, 'test', {
        name: 'test-release',
        description: 'release description',
      })
      const { data: release } = await githubClient.rest.repos.getRelease({
        repo: repoName,
        owner: GITHUB_TEST_OWNER,
        release_id: Number(releaseId),
      })
      expect(release).toMatchObject({
        name: 'test-release',
        body: 'release description',
      })
    })

    it('getRelease', async () => {
      const { headCommit, githubPlatform } = await prepareRepository()
      await githubPlatform.addTagAndRelease(headCommit, 'test', {
        name: 'test-release',
        description: 'release description',
      })
      const [, release] = await githubPlatform.getRelease('test')
      expect(release).toMatchObject({
        name: 'test-release',
        description: 'release description',
      })
    })

    it('createRelease', async () => {
      const { headCommit, githubPlatform } = await prepareRepository()
      await githubPlatform.addTag(headCommit, 'test')
      await githubPlatform.createRelease('test', {
        name: 'test-release',
        description: 'release description',
      })
      const [, release] = await githubPlatform.getRelease('test')
      expect(release).toMatchObject({
        name: 'test-release',
        description: 'release description',
      })
    })

    it('createRelease should fail if tag not exist', async () => {
      const { githubPlatform } = await prepareRepository()
      await expect(githubPlatform.createRelease('test', {
        name: 'test-release',
        description: 'release description',
      })).rejects.toBeTruthy()
    })

    it('editRelease', async () => {
      const { headCommit, githubPlatform } = await prepareRepository()
      await githubPlatform.addTagAndRelease(headCommit, 'test', {
        name: 'test-release',
        description: 'release description',
      })
      await githubPlatform.editRelease('test', {
        name: 'edit-release',
        description: 'edit release description',
      })
      const [, release] = await githubPlatform.getRelease('test')
      expect(release).toMatchObject({
        name: 'edit-release',
        description: 'edit release description',
      })
    })

    it('upsertRelease should create release if it not exist', async () => {
      const { headCommit, githubPlatform } = await prepareRepository()
      await githubPlatform.addTag(headCommit, 'test')
      await githubPlatform.upsertRelease('test', {
        name: 'test-release',
        description: 'release description',
      })
      const [, release] = await githubPlatform.getRelease('test')
      expect(release).toMatchObject({
        name: 'test-release',
        description: 'release description',
      })
    })

    it('upsertRelease should edit release if it already exist', async () => {
      const { headCommit, githubPlatform } = await prepareRepository()
      await githubPlatform.addTag(headCommit, 'test')
      await githubPlatform.upsertRelease('test', {
        name: 'test-release',
        description: 'release description',
      })
      await githubPlatform.upsertRelease('test', {
        name: 'edit-release',
        description: 'edit release description',
      })
      const [, release] = await githubPlatform.getRelease('test')
      expect(release).toMatchObject({
        name: 'edit-release',
        description: 'edit release description',
      })
    })

    it('upsertRelease should fail if tag not found', async () => {
      const { githubPlatform } = await prepareRepository()
      await expect(githubPlatform.upsertRelease('test', {
        name: 'test-release',
        description: 'release description',
      })).rejects.toBeTruthy()
    })

    it('releasesIterator', async () => {
      const { headCommit, githubPlatform, repo, push, getHeadCommit } = await prepareRepository()

      // prepare second release commit
      await repo.touch('a', 'Change a')
      await push()

      const releases = [
        {
          tag: 'head',
          name: 'head-release',
          description: 'head release description',
          commit: headCommit,
        },
        {
          tag: 'second',
          name: 'second-release',
          description: 'second release description',
          commit: await getHeadCommit(),
        },
      ]
      for (const { tag, name, description, commit } of releases) {
        await githubPlatform.addTagAndRelease(commit, tag, {
          name,
          description,
        })
      }

      for await (const release of githubPlatform.releasesIterator()) {
        const sourceReleaseParams = releases.shift()!
        expect(release.commit!.id).toBe(sourceReleaseParams.commit)
        expect(release.name).toBe(sourceReleaseParams.name)
        expect(release.description).toBe(sourceReleaseParams.description)
      }
    })

    it('releasesTagsIterator', async () => {
      const { headCommit, githubPlatform, repo, push, getHeadCommit } = await prepareRepository()

      // prepare non release commit
      await repo.touch('b', 'Change b')
      await push()

      const tags = [
        {
          tag: 'v1.0.0',
          commit: headCommit,
        },
        {
          tag: 'non-release',
          commit: await getHeadCommit(),
        },
      ]
      for (const { tag, commit } of tags) {
        await githubPlatform.addTag(commit, tag)
      }

      const retrievedTags: any[] = []
      for await (const tag of githubPlatform.releaseTagsIterator()) {
        retrievedTags.push(tag)
      }
      expect(retrievedTags.length).toBe(1)
      expect(retrievedTags[0].name).toBe('v1.0.0')
    })
  })

  describe('merge request', () => {
    it('beginMrAttribution', async () => {
      const { repoName, repo, githubPlatform, push } = await prepareRepository()
      await createWorkflowedPullRequest(repoName, repo, push)
      await githubPlatform.beginMrAttribution()
      const mr = githubPlatform.requireMr()
      expect(mr.head.ref).toEqual('test-branch')
    })

    it('createMrNote/findMrNote', async () => {
      const { repoName, repo, githubPlatform, push } = await prepareRepository()
      await createWorkflowedPullRequest(repoName, repo, push)
      await githubPlatform.beginMrAttribution()
      const noteBody = `
---
kind: test
---

test
`
      await githubPlatform.createMrNote(noteBody)
      const metaComment = await githubPlatform.findMrNote('test')
      expect(metaComment?.content?.trim()).toEqual('test')
    })

    it('findMrNote should not find note if kind not defined', async () => {
      const { repoName, repo, githubPlatform, push } = await prepareRepository()
      await createWorkflowedPullRequest(repoName, repo, push)
      await githubPlatform.beginMrAttribution()
      const noteBody = `test`
      await githubPlatform.createMrNote(noteBody)
      const metaComment = await githubPlatform.findMrNote('test')
      expect(metaComment).toBeFalsy()
    })

    it('updateMrNote', async () => {
      const { repoName, repo, githubPlatform, push } = await prepareRepository()
      await createWorkflowedPullRequest(repoName, repo, push)
      await githubPlatform.beginMrAttribution()
      const noteBody = `test`
      const note = await githubPlatform.createMrNote(noteBody)
      const newNoteBody = `
---
kind: test
---

test2
`
      await githubPlatform.updateMrNote(note.id, newNoteBody)
      const metaComment = await githubPlatform.findMrNote('test')
      expect(metaComment?.content.trim()).toBe('test2')
    })

    it('createProjectLabel/getProjectLabels', async () => {
      const { githubPlatform } = await prepareRepository()
      await githubPlatform.createProjectLabel('pvm-test', 'eeeeee')
      const labels: { name: string }[] = []
      for await (const label of githubPlatform.getProjectLabels()) {
        labels.push(label)
      }
      expect(labels.find(({ name }) => name === 'pvm-test')).toBeTruthy()
    })

    it('setMrLabels', async () => {
      const { repoName, repo, githubPlatform, push } = await prepareRepository()
      await githubPlatform.createProjectLabel('test', 'eeeeee')
      await createWorkflowedPullRequest(repoName, repo, push)
      await githubPlatform.beginMrAttribution()
      await githubPlatform.setMrLabels(['test'])
      await retryWithTimeout('expect setMrLabels', async () => {
        const mr = await githubPlatform.requireMr()
        const { data: fullMr } = await githubClient.rest.pulls.get({
          repo: repoName,
          owner: GITHUB_TEST_OWNER,
          pull_number: mr.number,
        })
        expect(fullMr.labels[0]).toMatchObject({
          name: 'test',
          color: 'eeeeee',
        })
      })
    })
  })

  it('fetchLatestSha', async () => {
    const { githubPlatform, headCommit } = await prepareRepository()

    expect(await githubPlatform.fetchLatestSha('master')).toBe(headCommit)
  })
})

async function prepareRepository() {
  const { repoName, repo } = await createRepo('simple-one')
  const githubPlatform = new GithubPlatform({
    config: {
      ...repo.config,
      github: {
        auth_strategy: 'authToken',
      },
    },
    hostApi: repo.di.get(HOST_API_TOKEN),
    globalFlags: repo.di.get(GLOBAL_FLAGS_TOKEN),
    cwd: repo.dir,
  })
  const headCommit = (await repo.execScript('git rev-parse HEAD')).stdout.trim()

  return {
    repoName,
    repo,
    githubPlatform,
    headCommit,
    push: async () => await repo.execScript(`git push https://pvm-repo-test:${env.PVM_GITHUB_TEST_REPO_TOKEN}@github.com/${GITHUB_TEST_OWNER}/${repoName}.git`),
    getHeadCommit: async () => (await repo.execScript('git rev-parse HEAD')).stdout.trim(),
  }
}

function genRepoName(): string {
  return `${new Date().valueOf()}-${randomUUID()}`
}

async function createRepo(initRepoOpts: any): Promise<{ owner: string, repoName: string, repoGitPath: string, repo: any }> {
  const repoName = genRepoName()
  await githubClient.rest.repos.createForAuthenticatedUser({
    name: repoName,
  })

  const repo = await initRepo(initRepoOpts)
  await repo.execScript(`git remote set-url origin https://github.com/${GITHUB_TEST_OWNER}/${repoName}.git`)

  await retryWithTimeout('initial git push', async () => {
    await repo.execScript(`git push https://pvm-repo-test:${env.PVM_GITHUB_TEST_REPO_TOKEN}@github.com/${GITHUB_TEST_OWNER}/${repoName}.git`)
  })

  return { owner: GITHUB_TEST_OWNER, repoName, repoGitPath: `git@github.com:pvm-test-bot/${repoName}.git`, repo }
}

async function createWorkflowedPullRequest(repoName: string, repo: any, push: () => Promise<void>) {
  await repo.execScript('git checkout -b test-branch')
  await repo.writeFile('.github/workflows/actions.yml', `
name: Test
on:
  pull_request:
    branches: [ master ]
jobs:
  build:
    runs-on: ubuntu-18.04
    steps:
      - uses: actions/checkout@v2
`, 'Add actions')
  await push()

  await githubClient.rest.pulls.create({
    repo: repoName,
    owner: GITHUB_TEST_OWNER,
    head: 'test-branch',
    base: 'master',
    title: 'test-pr',
  })

  // workaround for "workflow not triggered" problem (see https://stackoverflow.com/a/65644569/3715112)
  await repo.writeFile('workflow-trigger.txt', 'none', 'trigger workflow')
  await push()

  const workflowRun = await retryWithTimeout('workflow retrieve', async () => {
    const { data: { workflow_runs: workflowRuns } } = await githubClient.rest.actions.listWorkflowRunsForRepo({
      repo: repoName,
      owner: GITHUB_TEST_OWNER,
    })
    return workflowRuns[0] ?? RETRY_CONTINUE
  })

  if (!workflowRun) {
    throw new Error('Workflow not found')
  }

  await retryWithTimeout('run retrieve', async () => {
    await githubClient.rest.actions.getWorkflowRun({
      repo: repoName,
      owner: GITHUB_TEST_OWNER,
      run_id: workflowRun.id,
    })
  })

  // after all run may be still not retrievable
  await sleep(2000)

  env.GITHUB_RUN_ID = workflowRun.id

  return env.GITHUB_RUN_ID
}

// github returns success response sometimes before actual apply
async function retryWithTimeout(what: string, fn: () => Promise<any>, timeLimit = API_ATTEMPTS_TIME_LIMIT) {
  let result
  let success
  let lastErr
  const attemptsTimeout = new Date().valueOf() + timeLimit
  while (!success && new Date().valueOf() < attemptsTimeout) {
    process.stderr.write(`attempt to ${what} at ${new Date()}\n`)
    await sleep(API_ATTEMPT_THROTTLE)
    try {
      result = await fn()
      if (result !== RETRY_CONTINUE) {
        success = true
      }
    } catch (e) {
      lastErr = e
    }
  }

  if (!success && lastErr) {
    throw lastErr
  }

  return result
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
