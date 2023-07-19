import type { NpmRegistryMock } from '../npm-registry-mock'
import { runRegistryMockServer } from '../npm-registry-mock'
import type { RepoTestApi } from '../types'
import initRepo from '../initRepo'
import { runScript } from '../executors'
import { writeRepo } from '../writeRepo'

function ccTagNotes(repo: RepoTestApi, tagName: string) {
  const notes = repo.tagNotes(tagName)
  return notes.split(repo.dir).join('')
}

async function makeConvCommits(repo: RepoTestApi) {
  await repo.touch('src/a/nf', `feat(pencil): add 'graphiteWidth' option`)
  await repo.touch('src/b/nf', `perf(pencil): remove graphiteWidth option\n\nBREAKING CHANGE: The graphiteWidth option has been removed. The default graphite width of 10mm is always used for performance reason.`)
  await repo.touch('src/c/nf', `fix(graphite): stop graphite breaking when width < 0.1\n\nCloses #28`)
  await repo.touch('src/d/nf', `feat(oil)!: support major commits via excl\n\nCloses #PVM-166`)
}

async function makeNonConvCommits(repo: RepoTestApi) {
  await repo.touch('src/c/nff', `set graphite width max to 0.2\n\nCloses #29`)
}

describe('pvm-plugin/conventional-changelog', () => {
  it('should work with angular preset', async () => {
    const repo = await initRepo('mono-conventional-c', {
      tagging: {
        for_packages: {
          enabled: true,
        },
      },
      changelog: {
        renderer: {
          type: 'builtin.list',
          show_date: false,
        },
      },
      plugins_v2: [{
        plugin: require.resolve('@pvm/plugin-conventional-changelog'),
      }],
    })
    await makeConvCommits(repo)
    await repo.linkNodeModules()
    await runScript(repo, 'pvm update')

    expect(repo.pkgTags()).toEqual([
      'a-v1.1.0',
      'b-v3.0.0',
      'c-v1.2.4',
      'd-v2.0.0',
    ])
  }, 40000)

  it('should generate release notes', async () => {
    const repo = await initRepo('mono-conventional-c', {
      tagging: {
        for_packages: {
          enabled: true,
          as_release: true,
        },
      },
      changelog: {
        renderer: {
          type: 'builtin.list',
          show_date: false,
        },
      },
      plugins_v2: [{
        plugin: require.resolve('@pvm/plugin-conventional-changelog'),
      }],
    })
    await makeConvCommits(repo)
    await repo.linkNodeModules()
    await runScript(repo, 'pvm update')

    expect(ccTagNotes(repo, 'a-v1.1.0')).not.toEqual('')
    expect(ccTagNotes(repo, 'b-v3.0.0')).not.toEqual('')
    expect(ccTagNotes(repo, 'c-v1.2.4')).not.toEqual('')
  }, 45000)

  it('should allow alter releaseType choose logic', async () => {
    const repo = await initRepo('mono-conventional-c', `{
      update: {
        default_release_type: 'none'
      },
      plugins_v2: [{
        plugin: "${require.resolve('@pvm/plugin-conventional-changelog').replace(/\\/g, '/')}",
        options: {
          whatBump: (commits) => {
            return commits.every(c => c.type === 'chore') ? null : 'patch'
          },
        }
      }]
    }`, { configFormat: 'js' })
    await repo.linkNodeModules()

    await repo.touch('src/a/nf', `chore: ci changes`)
    let updateState = await repo.getUpdateState()
    let pkgA = updateState.repo.pkgset.get('a')!
    expect(updateState.newVersions.get(pkgA)).toBe('1.0.0')
    expect(updateState.getReleasePackages().get(pkgA)).toBeFalsy()

    await repo.touch('src/a/up', `fix: version bump change`)
    updateState = await repo.getUpdateState()
    pkgA = updateState.repo.pkgset.get('a')!
    expect(updateState.newVersions.get(pkgA)).toBe('1.0.1')
    expect(updateState.getReleasePackages().get(pkgA)).toBeTruthy()
  }, 45000)

  describe('@pvm/plugin-conventional-semantic-release', () => {
    it('should not create release on chore: commit', async () => {
      const repoPath = writeRepo({ name: 'release-type-builder', spec: 'src/a@1.0.0,src/b@1.0.0' })

      const repo = await initRepo(repoPath, {
        plugins_v2: [{
          plugin: require.resolve('@pvm/plugin-conventional-changelog'),
        }, {
          plugin: require.resolve('@pvm/plugin-conventional-semantic-release'),
        }],
      })
      await repo.updatePkg('.', {
        dependencies: {
          '@pvm/plugin-conventional-changelog': 'not meant to be installed',
          '@pvm/plugin-conventional-semantic-release': 'not meant to be installed',
        },
      })
      await repo.linkNodeModules()

      await repo.touch('src/a/nf', `chore: ci changes`)
      await repo.runScript('pvm update')
      expect(repo.lastReleaseTag()).toBeFalsy()
    }, 45000)

    it('should create patch release on fix: commit', async () => {
      const repoPath = writeRepo({ name: 'release-type-builder', spec: 'src/a@1.0.0,src/b@1.0.0' })

      const repo = await initRepo(repoPath, {
        plugins_v2: [{
          plugin: require.resolve('@pvm/plugin-conventional-changelog'),
        }, {
          plugin: require.resolve('@pvm/plugin-conventional-semantic-release'),
        }],
      })
      await repo.updatePkg('.', {
        dependencies: {
          '@pvm/plugin-conventional-changelog': 'not meant to be installed',
          '@pvm/plugin-conventional-semantic-release': 'not meant to be installed',
        },
      })
      await repo.linkNodeModules()

      await repo.touch('src/a/nf', `fix: some fix`)
      await repo.runScript('pvm update')

      expect(repo.lastReleaseTag()).toBeTruthy()
      expect(repo.readPkg('src/a')).toMatchObject({
        version: '1.0.1',
      })
    }, 45000)

    it('should handle custom rules', async () => {
      const repoPath = writeRepo({ name: 'release-type-builder', spec: 'src/a@1.0.0,src/b@1.0.0' })

      const repo = await initRepo(repoPath, {
        plugins_v2: [{
          plugin: require.resolve('@pvm/plugin-conventional-changelog'),
        },
        {
          plugin: require.resolve('@pvm/plugin-conventional-semantic-release'),
          options: {
            releaseRules: [
              {
                type: 'fix',
                release: 'major',
              },
            ],
          },
        },
        ],
      })

      await repo.linkNodeModules()

      await repo.touch('src/a/nf', `fix: some fix`)
      await repo.runScript('pvm update')

      expect(repo.lastReleaseTag()).toBeTruthy()
      expect(repo.readPkg('src/a')).toMatchObject({
        version: '2.0.0',
      })
    }, 45000)
  })

  describe('publish', () => {
    let npmControls: NpmRegistryMock
    beforeAll(async () => {
      npmControls = await runRegistryMockServer()
    })

    afterEach(() => {
      npmControls.clear()
    })

    afterAll(() => {
      npmControls.stop()
    })

    it('should produce messenger message from conv. commits without fail', async () => {
      const repo = await initRepo('mono-conventional-c', {
        versioning: {
          unified_versions_for: ['*'],
        },
        plugins_v2: [{
          plugin: require.resolve('@pvm/plugin-conventional-changelog'),
        }],
      })

      await repo.tag('v1.0.0', 'initial release')
      await makeConvCommits(repo)
      await makeNonConvCommits(repo)
      await repo.linkNodeModules()
      await runScript(repo, 'pvm update')

      let output = ''
      await runScript(repo, `pvm publish -r ${npmControls.registryUrl}`, {
        printStderr: true,
        stdio: ['pipe', 'pipe', {
          // @ts-ignore
          write: message => {
            output += message
          },
        }],
        env: {
          ...process.env,
          CI_PROJECT_PATH: 'mono-conventional-c_2',
        },
      })
      expect(output).toMatch(/Features\*\*\\n {2}• \(oil\)!: support major commits via excl \(\[.+?]\(.+?\)/)
      expect(output).toMatch(/Performance Improvements\*\*\\n {2}• \(pencil\): remove graphiteWidth option \(\[.+?]\(.+?\)/)
      expect(output).toMatch(/Bug Fixes\*\*\\n {2}• \(graphite\): stop graphite breaking when width < 0.1 \(\[.+?]\(.+?\)/)
      expect(output).toContain(`BREAKING CHANGES**\\n  • (oil): support major commits via excl\\n  • (pencil): The graphiteWidth option has been removed. The default graphite width of 10mm is always used for performance reason.`)
      expect(output).toMatch(/Other\*\*\\n {2}• set graphite width max to 0.2 \(\[.+?]\(.+?\)/)
    }, 100000)

    it('should not fail send message on custom publish strategy', async () => {
      const repo = await initRepo('mono-conventional-c', {
        tagging: {
          for_packages: {
            enabled: true,
            as_release: true,
          },
        },
        changelog: {
          renderer: {
            type: 'builtin.list',
            show_date: false,
          },
        },
        plugins_v2: [{
          plugin: require.resolve('@pvm/plugin-conventional-changelog'),
        }],
      })
      await makeConvCommits(repo)
      await repo.linkNodeModules()
      let output = ''
      await runScript(repo, `pvm publish -r ${npmControls.registryUrl} -s stale`, {
        printStderr: true,
        stdio: ['pipe', 'pipe', {
          // @ts-ignore
          write: message => {
            output += message
          },
        }],
      })

      expect(output).not.toMatch(/Couldn't locate/)
    }, 100000)
  })
})