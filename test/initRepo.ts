import { HOST_API_TOKEN, Pvm } from '@pvm/pvm'
import type { Config, RecursivePartial } from '@pvm/pvm'

import { CacheTag, taggedCacheManager } from '../packages/pvm/lib/memoize'
import os from 'os'
import { getGitConfigTools } from './gitConfig'
import type { User } from './fixtures/users'
import { getUser, mapUsers } from './fixtures/users'
import { dataFor } from './git/data'
import { execScript, runScript } from './executors'
import { writeConfig } from './helpers'
import { reposDir } from './repos-dir'
import { setTagNotes, tagNotes } from './git/tagNotes'
import { getTagAnnotation } from '../packages/pvm/lib/git/commands'
import { loadPkg } from '../packages/pvm/lib/pkg'
import { pkgTagRe } from '../packages/pvm/lib/tag-meta'
import { shell as __unsafe_shell } from '../packages/pvm/lib/shell'
import { httpreq } from '../packages/pvm/lib/httpreq'
import { lastReleaseTag } from '../packages/pvm/lib/git/last-release-tag'
import fse from 'fs-extra'
import fs from 'fs'
import path from 'path'
import type { RepoTestApi } from './types'

const isPkgTag = pkgTagRe.test.bind(pkgTagRe)

const pvmRoot = path.resolve(__dirname, '..')

function processPackageRoot(repoDir: string) {
  const pkgPath = path.join(repoDir, 'package.json')
  if (fs.existsSync(pkgPath)) {
    const pkgStr = fs.readFileSync(pkgPath).toString('utf8')
    const patched = pkgStr
      .replace(/<PVM_ROOT>/g, path.relative(repoDir, pvmRoot))

    fs.writeFileSync(pkgPath, patched)
  }
}

const initRepo = async (name: string, config?: RecursivePartial<Config>, repoOpts: {
  cwd?: string,
  configFormat?: 'json' | 'toml' | 'js'
  empty?: boolean
} = {}): Promise<RepoTestApi> => {
  let fullRepoDir = name
  let projectRoot = repoOpts.cwd ?? fullRepoDir

  if (!path.isAbsolute(name)) {
    const baseName = name

    let repoDir = `${reposDir}/${name}`
    let i = 1
    while (fs.existsSync(repoDir)) {
      name = `${baseName}_${i++}`
      repoDir = `${reposDir}/${name}`
    }
    try {
      fs.mkdirSync(repoDir, {
        recursive: true,
      })
    } catch (e: any) {
      if (e.code === 'EEXIST') {
        return initRepo(baseName, config)
      }
      throw e
    }

    fullRepoDir = path.resolve(__dirname, '..', repoDir)

    const templateDir = `test/repos/${baseName}`
    projectRoot = repoOpts.cwd ? path.join(fullRepoDir, repoOpts.cwd) : fullRepoDir

    if (fs.existsSync(templateDir)) {
      await fse.copy(templateDir, fullRepoDir)

      processPackageRoot(projectRoot)
    }
  } else {
    name = path.basename(name)
  }

  if (config) {
    await writeConfig({ dir: projectRoot }, config, repoOpts.configFormat)
  }

  const gitShell = (cmd: string, opts = {}) => __unsafe_shell(cmd, { ...opts, cwd: fullRepoDir }).trim()

  const gitConfigTools = getGitConfigTools(gitShell)

  gitShell(`git init .`)
  gitConfigTools.setGitNameAndEmail()
  // quotes for crossplatform gnu utility call (https://superuser.com/a/1253385)
  gitShell('"mkdir" -p .git/releases')
  gitShell('"mkdir" -p .git/gl')

  const repoData = dataFor(fullRepoDir)

  function makePvmApp() {
    return new Pvm({
      cwd: projectRoot,
    })
  }

  let repoApp = makePvmApp()

  const repoConfig = repoApp.getConfig()

  const repoTestApi: RepoTestApi = {
    dir: projectRoot,
    cwd: projectRoot,
    data: repoData,
    get config() {
      return repoConfig
    },
    get di() {
      return repoApp.container
    },
    async updateConfig(config) {
      await writeConfig({ dir: this.cwd }, config, repoOpts.configFormat)
      repoApp = makePvmApp()
    },
    async syncConfig() {
      repoApp = makePvmApp()
    },
    getHostApi() {
      return repoApp.container.get(HOST_API_TOKEN)
    },
    approvers(pickAttr?: keyof User) {
      const users = mapUsers(repoData.get('mr_approvals.approvers_ids'), false).sort((a, b) => {
        if (a.username === b.username) {
          return 0
        }
        return a.username > b.username ? 1 : -1
      })
      if (pickAttr) {
        return users.map(u => u[pickAttr])
      }
      return users
    },
    setApprovers(usernames: string[]) {
      repoData.set('mr_approvals.approvers_ids', usernames.reduce((acc, username) => {
        const user = getUser(username)
        if (user) {
          acc.push(user.id)
        } else {
          throw new Error(`no such user ${username}`)
        }
        return acc
      }, [] as number[]))
    },
    shell: gitShell,
    lastReleaseTag() {
      return lastReleaseTag(repoConfig)
    },
    getUpdateState() {
      return repoApp.getUpdateState()
    },
    readPkg(pkgPath) {
      return JSON.parse(
        fs.readFileSync(path.join(this.cwd, pkgPath, 'package.json'), 'utf-8')
      )
    },
    updatePkg(pkgPath, patch) {
      const original = this.readPkg(pkgPath)
      const patched = { ...original, ...patch }

      fs.writeFileSync(
        path.join(this.cwd, pkgPath, 'package.json'),
        JSON.stringify(patched, null, '  '),
        'utf-8'
      )
    },
    pkgVersion(pkgPath: string) {
      return this.readPkg(pkgPath).version
    },
    tags(ref = 'HEAD') {
      return this.shell(`git tag --points-at ${ref}`).split(/\s+/)
    },
    pkgTags(ref = 'HEAD') {
      return this.shell(`git tag --list --points-at ${ref} *-v[0-9]*`).split(/\s+/).filter(isPkgTag).sort()
    },
    pkgTagsAll() {
      return this.shell(`git tag --list *-v[0-9]*`).split(/\s+/).filter(isPkgTag).sort()
    },
    async runScript(cmd, opts) {
      return cmd.startsWith('pvm ') ? gitConfigTools.runInPureEnvironment(() => runScript(this, cmd, opts)) : runScript(this, cmd, opts)
    },
    async execScript(cmd, opts) {
      return cmd.startsWith('pvm ') ? gitConfigTools.runInPureEnvironment(() => execScript(this, cmd, opts)) : execScript(this, cmd, opts)
    },
    mkdir(dir) {
      try {
        fs.mkdirSync(path.resolve(this.cwd, dir), {
          recursive: true,
        })
      } catch (e: any) {
        if (e.code !== 'EEXIST') {
          throw e
        }
      }
    },
    async glApiStats(resourceId) {
      const { json } = await httpreq(`${process.env.PVM_CONFIG_GITLAB__URL}/api/v4/projects/${name}/${resourceId}/stats`)
      return json
    },
    async addPkg(pkgPath, pkg) {
      this.mkdir(pkgPath)
      const manifestPath = path.join(pkgPath, 'package.json')
      await runScript(this, `cat > ${manifestPath} && git add ${manifestPath}`, {
        input: JSON.stringify(pkg, null, 2),
      })
    },
    async writeFile(filepath, contents, commit) {
      this.mkdir(path.dirname(filepath))
      await this.runScript(`cat > ${filepath} && git add ${filepath}`, {
        input: contents,
      })
      if (commit) {
        await this.runScript('git commit -F -', {
          input: commit,
        })
      }
    },
    async rm(path) {
      await this.runScript(`git rm -rf ${path}`)
    },
    async touch(filepaths, commitMessage) {
      if (!Array.isArray(filepaths)) {
        filepaths = [filepaths]
      }
      const cmd: string[] = []
      const createdDirs = Object.create(null)
      for (const filepath of filepaths) {
        if (!(filepath in createdDirs)) {
          this.mkdir(path.dirname(filepath))
        }

        cmd.push(`touch ${filepath} && git add ${filepath}`)
      }

      let opts
      if (commitMessage) {
        opts = {
          input: commitMessage,
        }
        cmd.push('git commit -F -')
      }
      await this.runScript(cmd.join(' && '), opts)
    },
    async tag(tagName, notes = void 0) {
      await this.runScript(`git tag ${tagName}`)
      if (notes) {
        await setTagNotes(this.cwd, tagName, notes)
      }
      taggedCacheManager.clear(this.cwd, [CacheTag.gitFetchTags])
    },
    async annotatedTag(tagName, annotation, ref = 'HEAD') {
      await this.runScript(`git tag --file=- ${tagName} ${ref}`, { input: annotation })
    },
    loadPkg(pkgPath, ref = void 0) {
      return loadPkg(this.config, pkgPath, { cwd: this.cwd, ref: ref })
    },
    async linkNodeModules() {
      const source = path.resolve('node_modules')
      const target = path.join(this.cwd, 'node_modules')
      if (os.platform() === 'win32') {
        await runScript(this, `mklink /D "${target}" "${source}"`)
      } else {
        await runScript(this, `ln -s "${source}" "${target}"`)
      }
    },
    async commit(message) {
      if (!message) {
        throw new Error('commit message required')
      }
      await runScript(this, `git commit -F -`, {
        input: message,
      })
    },
    async commitAll(message) {
      if (!message) {
        throw new Error('commit message required')
      }
      await runScript(this, `git add . && git commit -F -`, {
        input: message,
      })
    },
    lastReleaseNotes() {
      const releaseTag = this.lastReleaseTag()
      return tagNotes(this.cwd, releaseTag)
    },
    tagNotes(tagName) {
      return tagNotes(this.cwd, tagName)
    },
    getTagAnnotation(tagName) {
      return getTagAnnotation(this.cwd, tagName)
    },
    readFile(relPath, encoding: 'utf8' | 'ascii' | 'hex' = 'utf8') {
      return fs.readFileSync(path.resolve(this.cwd, relPath)).toString(encoding)
    },
    existsPath(relPath) {
      return fs.existsSync(path.resolve(this.cwd, relPath))
    },
    env: {
      CI_PROJECT_ID: name,
      get CI_COMMIT_SHA() {
        return gitShell(`git rev-parse HEAD`)
      },
      get CI_COMMIT_REF_NAME() {
        return gitShell(`git rev-parse --abbrev-ref HEAD`)
      },
    },
    get head() {
      return gitShell(`git rev-parse HEAD`)
    },
  }

  const initialSetupPath = path.join(fullRepoDir, '_setup.js')

  let setupFunc: null | ((repoTestApi: RepoTestApi) => void) = null
  if (fs.existsSync(initialSetupPath)) {
    setupFunc = require(initialSetupPath)
    fs.unlinkSync(initialSetupPath)
  }

  if (!gitShell(`ls`) && !repoOpts.empty) {
    fs.writeFileSync(path.join(projectRoot, 'package.json'), JSON.stringify({
      name: name,
      version: '1.0.0',
    }))
  }

  let noCommits = true
  try {
    gitShell(`git log`)
    noCommits = false
  } catch (e) {}

  if (noCommits) {
    gitShell(`git add .`)
    gitShell(`git commit -am "initialization"`)

    gitShell(`git remote add origin file://${fullRepoDir}`)
    gitShell(`git fetch`)
    gitShell(`git fetch origin`)
  }

  if (setupFunc) {
    await setupFunc(repoTestApi)
  }

  return repoTestApi
}

export default initRepo
