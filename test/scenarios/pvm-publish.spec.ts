import fs from 'fs'
import path from 'path'
import type { NpmRegistryMock } from '../npm-registry-mock'
import { runRegistryMockServer } from '../npm-registry-mock'

import type { SlackMock } from '../slack-mock'
import { runMessengerMocker } from '../slack-mock'

import fsExtra from 'fs-extra'
import execShell from '@pvm/pvm/lib/shell/exec'
import type { RepoTestApi } from '../types'
import { execScript, runScript } from '../executors'
import initRepo from '../initRepo'
import type { PublishedStats } from '@pvm/pvm'
import { writeRepo } from '../writeRepo'

function readStats(repo: RepoTestApi, statsName = 'publish-stats.json'): PublishedStats {
  const rawStr = fs.readFileSync(path.join(repo.dir, statsName)).toString('utf8')
  const body: any = JSON.parse(rawStr)
  body.success.sort((a: any, b: any) => {
    if (a.pkg === b.pkg) {
      return 0
    }
    if (a.pkg > b.pkg) {
      return 1
    }
    return -1
  })

  body.success.forEach((x: any) => {
    delete x.absPath
    delete x.manifestPath
    Object.keys(x).forEach(k => {
      if (k.startsWith('_')) {
        delete x[k]
      }
    })
  })

  return body
}

function readStatsAsStr(repo: RepoTestApi, statsName = 'publish-stats.json') {
  return JSON.stringify(readStats(repo, statsName), null, 2)
}

async function nativePublish({
  repo,
  pkgPath,
  version,
  tag,
  registry,
}: {
  repo: RepoTestApi,
  pkgPath: string,
  version: string,
  tag: string,
  registry: string,
}) {
  await repo.updatePkg(pkgPath, {
    version,
  })
  await repo.writeFile('.npmrc', `_auth = "fooBar"`)
  await runScript(repo, `npm publish ${repo.dir}/${pkgPath} --tag ${tag} --registry ${registry}`)
}

describe('pvm/publish', () => {
  let npmControls: NpmRegistryMock
  let testPublish: (repo: RepoTestApi, cmdArgsStr: string, env?: Record<string, any>) => Promise<void>
  beforeAll(async () => {
    npmControls = await runRegistryMockServer()
    testPublish = function testPublish(repo, cmdArgsStr, env) {
      return runScript(repo, `pvm publish -r ${npmControls.registryUrl} ${cmdArgsStr}`, {
        env: {
          ...process.env,
          PVM_FORCE_TEST_PUBLISH: 'true',
          ...env,
        },
      })
    }
  })

  afterEach(() => {
    process.env['npm_config_user_agent'] = undefined
    delete process.env['npm_config_user_agent']
    npmControls.clear()
  })

  afterAll(() => {
    npmControls.stop()
  })

  it('команда pvm publish успешно отрабатывает c опцией output-stats', async () => {
    const repo = await initRepo('mono-auto-deps')
    await repo.touch('src/d/d_file', 'change d')

    await runScript(repo, 'pvm update')
    await testPublish(repo, '--output-stats=publish-stats.json')
    expect(readStatsAsStr(repo, 'publish-stats.json')).toMatchSnapshot()
  }, 50000)

  // тест не стабилен
  it('паблиш на релизном тэге вот-с-таким-кейсом', async () => {
    const releaseTag = 'release-29.12.2018-prince-of-orphans'

    const repo = await initRepo('monorepo-new')
    await repo.touch('src/a/nf', 'change a')
    await repo.tag(releaseTag)

    await testPublish(repo, `-s changed-since-release -S ref=${releaseTag} --dry-run -o publish-stats.json`)
    expect(readStatsAsStr(repo, 'publish-stats.json')).toMatchSnapshot()
  })

  it('паблиш с замапленной папки', async () => {
    const repo = await initRepo('mono-nested', {
      publish: {
        path_mapping: {
          'src/blocks': 'lib',
        },
      },
    })
    await repo.touch('src/blocks/c/nf', 'change c')

    repo.shell('cp -R src/blocks lib')

    await runScript(repo, 'pvm update')
    await testPublish(repo, '-o publish-stats.json')
    expect(readStatsAsStr(repo, 'publish-stats.json')).toMatchSnapshot()
  })

  it('multi-package: get version for publishing from git', async () => {
    const repo = await initRepo('monorepo-new', {
      versioning: {
        source: 'tag',
      },
    })

    await repo.tag('a-v10.0.0')
    await repo.tag('b-v20.0.0-rc.1')
    // and skip adding tag for c package

    await testPublish(repo, ` -s all -o publish-stats.json`)
    expect(readStatsAsStr(repo, 'publish-stats.json')).toMatchSnapshot()

    expect(repo.readPkg('src/a').version).toEqual('10.0.0')
    expect(repo.readPkg('src/b').version).toEqual('20.0.0-rc.1')
    expect(repo.readPkg('src/c').version).toEqual('0.0.1')
  })

  it('single-package: get version for publishing from git', async () => {
    const repo = await initRepo('two-releases', {
      versioning: {
        source: 'tag',
      },
    })

    await repo.touch('foo', 'changes')
    await repo.tag('v10.0.0')

    await testPublish(repo, ` -o publish-stats.json`)
    expect(readStatsAsStr(repo, 'publish-stats.json')).toMatchSnapshot()

    expect(repo.readPkg('.').version).toEqual('10.0.0')
  })

  it('не должен паблишить приватные пакеты', async () => {
    const repo = await initRepo('monorepo-new')
    await repo.addPkg('src/foo', {
      name: 'foo',
      version: '1.0.0',
      private: true,
    })

    await testPublish(repo, ` -o publish-stats.json`)
    const stats = readStats(repo)

    const successNames = stats.success.map((desc) => desc.pkg)
    expect(successNames).not.toContain('foo')
  })

  it('не должен паблишить пакеты, подпадающие под disabled_for', async () => {
    const repo = await initRepo('monorepo-new', {
      publish: {
        disabled_for: ['/src/c', 'b'],
      },
    })

    await testPublish(repo, ` --dry-run -o publish-stats.json -s all`)
    const stats = readStats(repo)

    const successNames = stats.success.map(desc => desc.pkg)
    expect(successNames).not.toContain('c')
    expect(successNames).not.toContain('b')
    expect(successNames).toContain('a')
  })

  it('должен паблишить только пакеты, подпадающие под enabled_only_for', async () => {
    const repo = await initRepo('monorepo-new', {
      publish: {
        enabled_only_for: ['/src/c', 'b'],
      },
    })

    await testPublish(repo, ` --dry-run -o publish-stats.json -s all`)
    const stats = readStats(repo)

    const successNames = stats.success.map(desc => desc.pkg)
    expect(successNames).not.toContain('a')
    expect(successNames).toContain('c')
    expect(successNames).toContain('b')
  })

  it('при публикации репозитория с выделенным версионированием должен заменять зависимости', async () => {
    const repo = await initRepo('monouno', {
      versioning: {
        source: 'file',
        source_file: 'versions.json',
      },
    })

    await repo.writeFile('versions.json', JSON.stringify({
      'a': '1.0.0',
      'b': '2.0.0',
      'c': '3.0.0',
    }), 'set versions')

    expect(repo.pkgVersion('src/a')).toEqual('10.0.0')
    expect(repo.readPkg('src/b').dependencies).toEqual({
      'a': '10.0.0',
    })

    await repo.runScript('pvm publish -s all')

    // на файлухе должно поменяться
    expect(repo.pkgVersion('src/a')).toEqual('1.0.0')
    expect(repo.pkgVersion('src/b')).toEqual('2.0.0')
    expect(repo.pkgVersion('src/c')).toEqual('3.0.0')
    // зависимости тоже должны поменяться
    expect(repo.readPkg('src/b').dependencies).toEqual({
      'a': '1.0.0',
    })
  })

  it('should not fail if there is no commit before first release tag', async () => {
    const repo = await initRepo('monorepo-new', {
      versioning: {
        source: 'tag',
        unified: ['src/*'],
      },
    })

    await repo.tag('v10.0.0')
    await repo.writeFile('src/a/t.txt', 'change', 'change')
    await repo.runScript(`pvm publish --dry-run -o publish-stats.json -s all`, {
      env: {
        CI_COMMIT_TAG: 'v10.0.0',
      },
    })
    const successNames = readStats(repo).success.map(desc => desc.pkg)

    expect(successNames).toContain('a')
    expect(successNames).toContain('c')
    expect(successNames).toContain('b')
  })

  it('should publish packages according to --packages-filter if presented', async () => {
    const repo = await initRepo('monorepo-new')

    await testPublish(repo, ` --dry-run -o publish-stats.json -s all -f /src/a -f /src/b`)
    const stats = readStats(repo)

    const successNames = stats.success.map(desc => desc.pkg)
    expect(successNames).toContain('a')
    expect(successNames).toContain('b')
    expect(successNames).not.toContain('c')
  })

  it('should provide strict-ssl value from .npmrc as env npm config if yarn v1 used', async () => {
    const repo = await initRepo('simple-one')
    await repo.writeFile('.npmrc', `strict-ssl = "strict-ssl value"`, `disable strict-ssl`)
    const { stdout } = await execShell(`node -r "${require.resolve('./__fixtures__/boot-test.js')}" -e "console.log(process.env['npm_config_strict_ssl'])" "${repo.cwd}"`, {
      env: {
        ...process.env,
        'npm_config_user_agent': 'yarn/1.22.19 npm/? node/v16.16.0 win32 x64',
      },
    })
    expect(stdout).toContain('strict-ssl value')
  })

  it('should not provide strict-ssl value from .npmrc as env npm config if yarn v1 not used', async () => {
    const repo = await initRepo('simple-one')
    await repo.writeFile('.npmrc', `strict-ssl = "strict-ssl value"`, `disable strict-ssl`)
    const { stdout } = await execShell(`node -r "${require.resolve('./__fixtures__/boot-test.js')}" -e "console.log(process.env['npm_config_strict_ssl'])" "${repo.cwd}"`, {
      env: process.env,
    })
    expect(stdout).not.toContain('strict-ssl value')
  })

  it('should take unified version from tag in case of unified wildcard and publish path set', async () => {
    const repoPath = writeRepo({ name: 'unified-publish-path', spec: 'src/a@1.0.0,src/b@1.0.0,src/c@1.0.0' })
    const repo = await initRepo(repoPath, {
      versioning: {
        unified: ['/src/a', '/src/b'],
        source: 'tag',
      },
      publish: {
        path_mapping: {
          'src': 'lib',
        },
      },
    })

    await repo.annotatedTag('v2.0.0', `release\n\n---\nc@0.44.1`)

    fsExtra.copySync(`${repoPath}/src/a`, `${repoPath}/lib/a`)
    fsExtra.copySync(`${repoPath}/src/b`, `${repoPath}/lib/b`)
    fsExtra.copySync(`${repoPath}/src/c`, `${repoPath}/lib/c`)

    await repo.runScript(`pvm publish --dry-run -o publish-stats.json -s all`)
    const pkgs = readStats(repo).success

    expect(pkgs.find(p => p.pkg === 'a')?.publishedVersion).toBe('2.0.0')
    expect(pkgs.find(p => p.pkg === 'b')?.publishedVersion).toBe('2.0.0')
    expect(pkgs.find(p => p.pkg === 'c')?.publishedVersion).toBe('0.44.1')
  })

  it('publish command should fail if some packages failed to publish', async () => {
    const repoPath = writeRepo({ name: 'invalid-publish-registry', spec: 'src/a@1.0.0,src/b@1.0.0' })
    const repo = await initRepo(repoPath)

    await repo.updatePkg('src/b', {
      publishConfig: {
        registry: 'invalid',
      },
    })

    await expect(() => testPublish(repo, '-s all')).rejects.toBeTruthy()
  })

  it('publish with --bail flag should fail if some packages failed to publish', async () => {
    const repoPath = writeRepo({ name: 'invalid-publish-registry', spec: 'src/a@1.0.0,src/b@1.0.0' })
    const repo = await initRepo(repoPath)

    await repo.updatePkg('src/b', {
      publishConfig: {
        registry: 'invalid',
      },
    })

    await expect(() => testPublish(repo, '-s all --bail')).rejects.toBeTruthy()
  })

  describe('canary', () => {
    let slackMocker: SlackMock
    beforeAll(async () => {
      slackMocker = await runMessengerMocker()
    })

    afterEach(() => {
      slackMocker.clear()
    })

    afterAll(() => {
      slackMocker.stop()
    })

    it('should publish canary version with 0 index if there is no published canary before', async () => {
      const repo = await initRepo('simple-one')
      await testPublish(repo, `-s all --canary`)
      const pkgInfo = JSON.parse((await execScript(repo, `npm view --registry ${npmControls.registryUrl} simple-one --json`)).stdout)
      expect(pkgInfo['dist-tags'][repo.env.CI_COMMIT_SHA]).toEqual(`0.1.0-${repo.env.CI_COMMIT_SHA}.0`)
    })

    it('should publish canary version with 1 if there is already published with 0 index', async () => {
      const repo = await initRepo('simple-one')
      await testPublish(repo, `-s all --canary`)
      await testPublish(repo, `-s all --canary`)
      const pkgInfo = JSON.parse((await execScript(repo, `npm view --registry ${npmControls.registryUrl} simple-one --json`)).stdout)
      expect(pkgInfo['dist-tags'][repo.env.CI_COMMIT_SHA]).toEqual(`0.1.0-${repo.env.CI_COMMIT_SHA}.1`)
    })

    it('should handle already published same version but with different tag', async () => {
      const repo = await initRepo('simple-one')
      repo.updatePkg('.', {
        version: `0.1.0-${repo.env.CI_COMMIT_SHA}.0`,
      })
      await repo.writeFile('.npmrc', `_auth = "fooBar"`)
      await runScript(repo, `npm publish --tag beta --registry ${npmControls.registryUrl}`)
      repo.updatePkg('.', {
        version: `0.1.0`,
      })
      await testPublish(repo, `-s all --canary`)
      const pkgInfo = JSON.parse((await execScript(repo, `npm view --registry ${npmControls.registryUrl} simple-one --json`)).stdout)
      expect(pkgInfo['dist-tags'][repo.env.CI_COMMIT_SHA]).toEqual(`0.1.0-${repo.env.CI_COMMIT_SHA}.1`)
    })

    it('should ignore current version preid when generate canary one', async () => {
      const repo = await initRepo('simple-one')
      repo.updatePkg('.', {
        version: `0.1.0-beta.2`,
      })
      await testPublish(repo, `-s all --canary`)
      const pkgInfo = JSON.parse((await execScript(repo, `npm view --registry ${npmControls.registryUrl} simple-one --json`)).stdout)
      expect(pkgInfo['dist-tags'][repo.env.CI_COMMIT_SHA]).toEqual(`0.1.0-${repo.env.CI_COMMIT_SHA}.0`)
    })

    it('should start canary index from 0 if there is already published canary version on tag but preid is differs', async () => {
      const repo = await initRepo('simple-one')
      repo.updatePkg('.', {
        version: `0.1.0-beta.0`,
      })
      await testPublish(repo, `--tag ${repo.env.CI_COMMIT_SHA}`)
      repo.updatePkg('.', {
        version: `0.1.0`,
      })
      await testPublish(repo, `-s all --canary`)
      const pkgInfo = JSON.parse((await execScript(repo, `npm view --registry ${npmControls.registryUrl} simple-one --json`)).stdout)
      expect(pkgInfo['dist-tags'][repo.env.CI_COMMIT_SHA]).toEqual(`0.1.0-${repo.env.CI_COMMIT_SHA}.0`)
    })

    it('should apply versions to deps if canary enabled', async () => {
      const repo = await initRepo('monostub')

      await repo.touch('src/a/modification.txt', 'modification')

      await testPublish(repo, `-s all --canary`)

      const pkgInfo = JSON.parse((await execScript(repo, `npm view --registry ${npmControls.registryUrl} b --json`)).stdout)

      expect(pkgInfo.dependencies).toMatchObject({
        a: `1.0.0-${repo.env.CI_COMMIT_SHA}.0`,
      })
    })

    // Negative scenario: If ref is not respected than canary calculator do not find corresponding pkg published
    // version in packages set returned from pkgsetAll. Then it assumes that "a" package, that is dependency of "b",
    // is not published as canary and preserve its version.
    it('should respect ref from selected pkgset', async () => {
      const repo = await initRepo('monostub')

      await repo.touch('src/a/modification.txt', 'modification')

      await testPublish(repo, `-s all -S ref=HEAD --canary`)

      const pkgInfo = JSON.parse((await execScript(repo, `npm view --registry ${npmControls.registryUrl} b --json`)).stdout)

      expect(pkgInfo.dependencies).toMatchObject({
        a: `1.0.0-${repo.env.CI_COMMIT_SHA}.0`,
      })
    })

    it('should apply normal versions for packages that are not released in canary', async () => {
      const repo = await initRepo('monostub')

      await repo.touch('src/b/modification.txt', 'modification')

      await testPublish(repo, ` --canary`)

      const pkgInfo = JSON.parse((await execScript(repo, `npm view --registry ${npmControls.registryUrl} b --json`)).stdout)

      expect(pkgInfo.dependencies).toMatchObject({
        a: `1.0.0`,
      })
    })

    it('should pass canary:$release info and commits from first commit to current HEAD to slack message', async () => {
      const slackRequestsBody: Array<Record<string, any>> = []
      slackMocker.spy((req) => {
        slackRequestsBody.push(req.body)
      })
      const repo = await initRepo('simple-one', {
        plugins_v2: [
          {
            plugin: require.resolve('@pvm/plugin-slack'),
          },
        ],
      })
      await testPublish(repo, `-s all --canary --notify --message-channel test`, {
        ...process.env,
        SLACK_API_URL: slackMocker.mockerUrl,
        SLACK_TOKEN: 'test',
      })

      expect(slackRequestsBody.length).toEqual(1)
      expect(slackRequestsBody[0]).toMatchObject({
        'username': 'simple-one minion',
        'blocks': [
          {
            'type': 'section',
            'text': {
              'type': 'mrkdwn',
              'text': `canary:${repo.env.CI_COMMIT_SHA} has been released\n• initialization`,
            },
          },
        ],
      })
    })

    it('should pass release name along with canary prefix in notification message', async () => {
      const slackRequestsBody: Array<Record<string, any>> = []
      slackMocker.spy((req) => {
        slackRequestsBody.push(req.body)
      })
      const repo = await initRepo('simple-one', {
        plugins_v2: [
          {
            plugin: require.resolve('@pvm/plugin-slack'),
          },
        ],
      })

      await repo.touch('modification_1.txt', 'modification_1')
      await runScript(repo, `pvm update`)
      await repo.touch('modification_2.txt', 'modification_2')

      await testPublish(repo, ` --canary --notify --message-channel test`, {
        ...process.env,
        SLACK_API_URL: slackMocker.mockerUrl,
        SLACK_TOKEN: 'test',
      })

      expect(slackRequestsBody.length).toEqual(1)
      expect(slackRequestsBody[0]).toMatchObject({
        'username': 'simple-one minion',
        'blocks': [
          {
            'type': 'section',
            'text': {
              'type': 'mrkdwn',
              'text': `v0.2.0-canary:${repo.env.CI_COMMIT_SHA} has been released\n• modification_2`,
            },
          },
        ],
      })
    })

    it('should pass messageChannel to message from flags', async () => {
      const slackRequestsBody: Array<Record<string, any>> = []
      slackMocker.spy((req) => {
        slackRequestsBody.push(req.body)
      })
      const repo = await initRepo('simple-one', {
        plugins_v2: [
          {
            plugin: require.resolve('@pvm/plugin-slack'),
          },
        ],
      })

      await testPublish(repo, `--canary --message-channel test-channel`, {
        ...process.env,
        SLACK_API_URL: slackMocker.mockerUrl,
        SLACK_TOKEN: 'test',
      })

      expect(slackRequestsBody[0]).toMatchObject({
        channel: 'test-channel',
      })
    })

    it('should send error notification to messageChannel if publication failed', async () => {
      const slackRequestsBody: Array<Record<string, any>> = []
      slackMocker.spy((req) => {
        slackRequestsBody.push(req.body)
      })
      const repo = await initRepo('simple-one', {
        plugins_v2: [
          {
            plugin: require.resolve('@pvm/plugin-slack'),
          },
        ],
      })

      await expect(testPublish(repo, `-r invalid-reg --canary --message-channel test-channel`, {
        ...process.env,
        SLACK_API_URL: slackMocker.mockerUrl,
        SLACK_TOKEN: 'test',
      })).rejects.toBeTruthy()

      expect(JSON.stringify(slackRequestsBody)).toMatch(/:warning:.+failed to release/)
    })

    it('should send error notification to messageChannel if publication partially failed', async () => {
      const slackRequestsBody: Array<Record<string, any>> = []
      slackMocker.spy((req) => {
        slackRequestsBody.push(req.body)
      })
      const repo = await initRepo('monorepo-new', {
        plugins_v2: [
          {
            plugin: require.resolve('@pvm/plugin-slack'),
          },
        ],
      })

      repo.updatePkg('src/a', {
        publishConfig: {
          registry: 'invalid-reg',
        },
      })

      await expect(testPublish(repo, ` -s all --canary --message-channel test-channel`, {
        ...process.env,
        SLACK_API_URL: slackMocker.mockerUrl,
        SLACK_TOKEN: 'test',
      })).rejects.toBeTruthy()

      expect(JSON.stringify(slackRequestsBody)).toMatch(/:warning:.+partially failed to release/)
    })

    it('should publish first latest release if have already published with alpha', async () => {
      const repo = await initRepo('simple-one')

      await testPublish(repo, ` -s all --tag alpha`, {
        ...process.env,
      })

      repo.updatePkg('.', {
        version: '1.0.1',
      })

      await testPublish(repo, ` -s all --tag latest`, {
        ...process.env,
      })

      const pkgInfo = JSON.parse((await execScript(repo, `npm view --registry ${npmControls.registryUrl} simple-one --json`)).stdout)

      expect(pkgInfo.versions).toContain(`1.0.1`)
    })

    it('should take into account published versions only with same preid when calc next prerelease index', async () => {
      const repo = await initRepo('simple-one')

      await testPublish(repo, ` -s all`, {
        ...process.env,
      })

      await testPublish(repo, ` -s all --canary --tag beta`, {
        ...process.env,
      })

      repo.updatePkg('.', {
        version: '0.1.0-rc.0',
      })
      await execScript(repo, `npm publish --registry ${npmControls.registryUrl} --tag beta`)
      repo.updatePkg('.', {
        version: '0.1.0',
      })

      await testPublish(repo, ` -s all --canary --tag beta`, {
        ...process.env,
      })

      const pkgInfo = JSON.parse((await execScript(repo, `npm view --registry ${npmControls.registryUrl} simple-one --json`)).stdout)

      expect(pkgInfo.versions).toContain(`0.1.0-beta.1`)
    }, 50000)

    it('should choose correct canary index if several published and matched canary releases found', async () => {
      const repo = await initRepo('simple-one')

      await testPublish(repo, ` -s all --canary --tag beta`, {
        ...process.env,
      })

      await testPublish(repo, ` -s all --canary --tag beta`, {
        ...process.env,
      })

      await testPublish(repo, ` -s all --canary --tag beta`, {
        ...process.env,
      })

      const pkgInfo = JSON.parse((await execScript(repo, `npm view --registry ${npmControls.registryUrl} simple-one --json`)).stdout)

      expect(pkgInfo.versions).toContain(`0.1.0-beta.0`)
      expect(pkgInfo.versions).toContain(`0.1.0-beta.1`)
      expect(pkgInfo.versions).toContain(`0.1.0-beta.2`)
    }, 50000)

    it('should be possible to publish root of monorepo', async () => {
      const repo = await initRepo('monorepo-new', {
        publish: {
          include_monorepo_root: true,
        },
      })

      await repo.updatePkg('.', {
        private: false,
        version: '0.0.1',
      })
      await repo.touch('package.json', 'up root package.json')
      await repo.touch('src/a/nf', 'change a')
      await repo.runScript('pvm update')

      await repo.updatePkg('.', {
        private: false,
        description: '',
        version: '0.0.1',
      })
      await repo.touch('package.json', 'up root package.json 2')
      await repo.runScript('pvm update')

      await testPublish(repo, '')

      const pkgInfo = JSON.parse((await execScript(repo, `npm view --registry ${npmControls.registryUrl} monorepo-new --json`)).stdout)

      expect(pkgInfo.version).toEqual('0.1.0')
    })

    describe('unified', () => {
      it('default', async () => {
        const repo = await initRepo(await writeRepo({
          name: 'canary_config',
          spec: 'pkgs/a@0.0.1,pkgs/b@0.0.2',
        }))

        await testPublish(repo, ` --canary -s all --canary-unified`)
        const pkgAInfo = JSON.parse((await execScript(repo, `npm view --registry ${npmControls.registryUrl} a --json`)).stdout)
        const pkgBInfo = JSON.parse((await execScript(repo, `npm view --registry ${npmControls.registryUrl} a --json`)).stdout)
        expect(pkgAInfo['dist-tags'][repo.env.CI_COMMIT_SHA]).toEqual(`0.0.0-${repo.env.CI_COMMIT_SHA}.0`)
        expect(pkgBInfo['dist-tags'][repo.env.CI_COMMIT_SHA]).toEqual(`0.0.0-${repo.env.CI_COMMIT_SHA}.0`)
      })

      it('base version', async () => {
        const repo = await initRepo(await writeRepo({
          name: 'canary_config',
          spec: 'pkgs/a@0.0.1,pkgs/b@0.0.2',
        }))

        await testPublish(repo, ` --canary -s all --tag alpha --canary-unified --canary-base-version 1.0.0`)
        const pkgAInfo = JSON.parse((await execScript(repo, `npm view --registry ${npmControls.registryUrl} a --json`)).stdout)
        const pkgBInfo = JSON.parse((await execScript(repo, `npm view --registry ${npmControls.registryUrl} a --json`)).stdout)
        expect(pkgAInfo['dist-tags']['alpha']).toEqual(`1.0.0-alpha.0`)
        expect(pkgBInfo['dist-tags']['alpha']).toEqual(`1.0.0-alpha.0`)
      })

      it('already published', async () => {
        const repo = await initRepo(await writeRepo({
          name: 'canary_config',
          spec: 'pkgs/a@0.0.1,pkgs/b@0.0.2',
        }))

        await testPublish(repo, ` --canary -s all --canary-unified --tag alpha `)
        await testPublish(repo, ` --canary -s all --canary-unified --tag alpha`)
        const pkgAInfo = JSON.parse((await execScript(repo, `npm view --registry ${npmControls.registryUrl} a --json`)).stdout)
        const pkgBInfo = JSON.parse((await execScript(repo, `npm view --registry ${npmControls.registryUrl} a --json`)).stdout)
        expect(pkgAInfo['dist-tags']['alpha']).toEqual(`0.0.0-alpha.1`)
        expect(pkgBInfo['dist-tags']['alpha']).toEqual(`0.0.0-alpha.1`)
      })

      it('canary published versions shift. Should take biggest version number.', async () => {
        const repo = await initRepo(await writeRepo({
          name: 'canary_config',
          spec: 'pkgs/a@0.0.1,pkgs/b@0.0.2',
        }))

        await nativePublish({
          repo,
          pkgPath: 'pkgs/a',
          version: '0.0.0-alpha.0',
          tag: 'alpha',
          registry: npmControls.registryUrl,
        })
        await testPublish(repo, ` --canary -s all --tag alpha`)
        const pkgAInfo = JSON.parse((await execScript(repo, `npm view --registry ${npmControls.registryUrl} a --json`)).stdout)
        const pkgBInfo = JSON.parse((await execScript(repo, `npm view --registry ${npmControls.registryUrl} a --json`)).stdout)
        expect(pkgAInfo['dist-tags']['alpha']).toEqual(`0.0.0-alpha.1`)
        expect(pkgBInfo['dist-tags']['alpha']).toEqual(`0.0.0-alpha.1`)
      })

      it('canary published versions double shift. Should take biggest version above all.', async () => {
        const repo = await initRepo(await writeRepo({
          name: 'canary_config',
          spec: 'pkgs/a@0.0.1,pkgs/b@0.0.2',
        }))

        await nativePublish({
          repo,
          pkgPath: 'pkgs/a',
          version: '0.0.0-alpha.1',
          tag: 'alpha',
          registry: npmControls.registryUrl,
        })
        await nativePublish({
          repo,
          pkgPath: 'pkgs/b',
          version: '0.0.0-alpha.2',
          tag: 'alpha',
          registry: npmControls.registryUrl,
        })
        await testPublish(repo, ` --canary -s all --canary-unified --tag alpha`)
        const pkgAInfo = JSON.parse((await execScript(repo, `npm view --registry ${npmControls.registryUrl} a --json`)).stdout)
        const pkgBInfo = JSON.parse((await execScript(repo, `npm view --registry ${npmControls.registryUrl} a --json`)).stdout)
        expect(pkgAInfo['dist-tags']['alpha']).toEqual(`0.0.0-alpha.3`)
        expect(pkgBInfo['dist-tags']['alpha']).toEqual(`0.0.0-alpha.3`)
      })
    })
  })
})
