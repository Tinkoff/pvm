const dedent = require('dedent')
const semver = require('semver')
const { deepMerge } = require('sprout-data')

const { UpdateReasonType } = require('@pvm/update/lib/update-state')

const revParse = require('@pvm/core/lib/git/rev-parse').default
const path = require('path')
const { reposDir } = require('../repos-dir')
const runShell = require('../../packages/pvm-core/lib/shell/run').default
const { execScript } = require('../executors')
const got = require('got')

const doTagsPlease = {
  tagging: {
    for_packages: {
      enabled: true,
    },
  },
}

const doNotDependantsPlease = {
  update: {
    update_dependants: false,
  },
}

const doTagsButNotDependantsPlease = {
  ...doTagsPlease,
  ...doNotDependantsPlease,
}

const doPkgNotedTags = {
  tagging: {
    for_packages: {
      enabled: true,
      as_release: true,
    },
  },
}

const doPkgNotedTagsButNotDeps = deepMerge({}, doPkgNotedTags, doNotDependantsPlease)

describe('pvm/update', () => {
  it.concurrent('should add tags if needed and update package.json', async () => {
    const repo = await initRepo('monorepo-new', doTagsButNotDependantsPlease)
    await runScript(repo, `touch src/a/new_file src/c/new_file_c && git add . && git commit -F -`, {
      input: 'change a and c',
    })

    await runScript(repo, 'pvm update')

    expect(repo.pkgTags()).toEqual([
      'a-v1.1.0',
      'c-v1.0.0',
    ])

    expect(repo.lastReleaseTag()).toEqual('release-2018.11.27-Gorno-Altaysk')
    expect(repo.lastReleaseNotes()).toEqual('change a and c')

    expect(repo.pkgVersion('src/a')).toEqual('1.1.0')
    expect(repo.pkgVersion('src/c')).toEqual('1.0.0')
  })

  it.concurrent('поддержка release-type=none для пропуска генерации новой версии', async () => {
    const repo = await initRepo('mono-none-release', doTagsButNotDependantsPlease)
    await runScript(repo, `touch src/a/new_file src/b/new_file_c && git add . && git commit -F -`, {
      input: 'change a and b',
    })

    await runScript(repo, 'pvm update')

    expect(repo.pkgTags()).toEqual([
      'a-v1.1.0',
    ])

    expect(repo.pkgVersion('src/b')).toEqual('2.0.0')
  })

  it.concurrent.skip('local update should not fail without detected platform, without testing env', async () => {
    const repo = await initRepo('monorepo-new')
    await runScript(repo, 'pvm local update', {
      env: {
        PVM_PLATFORM_TYPE: 'noop',
        PVM_TESTING_ENV: '',
      },
    })
  })

  it.concurrent('опция force-release для update-hints', async () => {
    const repo = await initRepo('mono-with-packs', doPkgNotedTagsButNotDeps)

    const updateHints = dedent`
      [release-types]
      major = [ 'r-b' ]

      [force-release]
      packages = [
        '/packs/**',
        'r-b',
      ]
      release-type = 'minor'
      release-notes = 'New versions for all packs'
    `
    await runScript(repo, `cat > update-hints.toml`, {
      input: updateHints,
    })
    await runScript(repo, `git add . && git commit -F -`, {
      input: 'add update-hints.toml',
    })

    await runScript(repo, 'pvm update')

    expect(repo.pkgTags()).toEqual([
      'a-v1.1.0',
      'b-v2.1.0',
      'c-v1.0.0',
      'r-b-v3.0.0',
    ])

    expect(repo.tagNotes('c-v1.0.0')).toEqual('New versions for all packs')
  })

  it.concurrent('опция force-release для update-hints, все пакеты', async () => {
    const repo = await initRepo('mono-with-packs', doPkgNotedTagsButNotDeps)
    await runScript(repo, `cat > update-hints.toml`, {
      input: dedent`
        [force-release]
        packages = [ '*' ]
      `,
    })
    await runScript(repo, 'git add . && git commit -am "rerelease all of them"')
    await runScript(repo, 'pvm update')

    expect(repo.pkgTags()).toEqual([
      'a-v1.0.1',
      'b-v2.0.1',
      'c-v1.0.0',
      'r-a-v1.0.1',
      'r-b-v2.0.1',
      'r-c-v1.0.0',
    ])

    expect(repo.tagNotes('c-v1.0.0')).toEqual('rerelease all of them')
  })

  it.concurrent('новым пакетам не должна выставляться новая версия', async () => {
    const repo = await initRepo('mono-empty')
    await runScript(
      repo,
      `"mkdir" -p src/foo && cat > src/foo/package.json && git add . && git commit -am "create package foo"`,
      {
        input: JSON.stringify({ version: '1.0.0', name: 'foo' }),
      }
    )

    await runScript(repo, 'pvm update')

    expect(repo.pkgVersion('src/foo')).toEqual('1.0.0')
  })

  it.concurrent('md-table print should not fail if new package exists', async () => {
    const repo = await initRepo('monorepo-new', {
      update: {
        include_root: true,
      },
    })
    await runScript(repo, 'mkdir src/foo && touch abc')
    await runScript(repo, 'cat > src/foo/package.json', {
      input: JSON.stringify({ version: '1.0.0', name: 'foo' }, null, 2),
    })
    await runScript(repo, 'touch src/a/nf')

    await runScript(repo, 'git add .')
    await runScript(repo, 'git commit -am newpkg')
    await runScript(repo, 'pvm update -p md-table')
  })

  it.concurrent('release-type=none should not affect new created packages', async () => {
    const repo = await initRepo('monorepo-new', doTagsButNotDependantsPlease)

    await runScript(repo, 'mkdir src/foo')
    const foo = {
      name: 'foo',
      version: '1.0.0',
    }
    await runScript(repo, 'cat > src/foo/package.json', {
      input: JSON.stringify(foo, null, 2),
    })

    await runScript(repo, 'cat > update-hints.toml', {
      input: dedent`
        [release-types]
        none = ['foo']
      `,
    })

    await runScript(repo, 'git add .')
    await runScript(repo, 'git commit -am changes')

    await runScript(repo, 'pvm update')

    expect(repo.pkgVersion('src/foo')).toEqual('1.0.0')

    expect(repo.pkgTags()).toEqual([
      'foo-v1.0.0',
    ])
  })

  it.concurrent('add new package who depends on new package also with release-type=as-dep for deps', async () => {
    const repo = await initRepo('monorepo-new', {
      update: {
        dependants_release_type: 'as-dep',
      },
      tagging: {
        for_packages: {
          enabled: true,
        },
      },
    })

    await repo.addPkg('src/foo', {
      name: 'foo',
      version: '1.0.0',
    })
    await repo.addPkg('src/bar', {
      name: 'bar',
      version: '1.0.0',
      dependencies: {
        'foo': '1.0.0',
      },
    })
    await repo.commitAll('create packages')

    await runScript(repo, 'pvm update -p md-table')
    await runScript(repo, 'pvm update')

    expect(repo.pkgVersion('src/foo')).toEqual('1.0.0')
    expect(repo.pkgVersion('src/bar')).toEqual('1.0.0')

    expect(repo.pkgTags()).toEqual([
      'bar-v1.0.0',
      'foo-v1.0.0',
    ])
  })

  it.concurrent('should not increment versions for two new packages where one depends on another', async () => {
    const repo = await initRepo('monorepo-new', {
      update: {
        dependants_release_type: 'patch',
      },
      tagging: {
        for_packages: {
          enabled: true,
        },
      },
    })
    await repo.addPkg('src/foo', {
      name: 'foo',
      version: '1.0.0',
    })
    await repo.addPkg('src/bar', {
      name: 'bar',
      version: '1.0.0',
      dependencies: {
        'foo': '1.0.0',
      },
    })
    await repo.commit('changes')

    await runScript(repo, 'pvm update -p md-table')
    await runScript(repo, 'pvm update')

    expect(repo.pkgTags()).toEqual([
      'bar-v1.0.0',
      'foo-v1.0.0',
    ])
  })

  it.concurrent('существующие тэги не должны аффектить релиз', async () => {
    const repo = await initRepo('monorepo-new', {
      tagging: {
        for_packages: {
          enabled: true,
          as_release: true,
        },
      },
    })
    await repo.touch('src/b/nf')
    await repo.commit('change b')
    await repo.tag('foo-tag')

    await repo.touch('src/a/nf')
    await repo.commit('change a')

    await repo.runScript('pvm update -P vcs=gitlab')

    expect(repo.pkgTags()).toEqual([
      'a-v1.1.0',
      'b-v2.1.0',
    ])

    expect(repo.tagNotes('a-v1.1.0')).toEqual('change a')
    expect(repo.tagNotes('b-v2.1.0')).toEqual('change b')
  })

  it.concurrent('должен корректно ставить тэг только одному пакету, если есть такой же с тем же префиксом', async () => {
    const repo = await initRepo('two-packages-with-same-prefix')
    await writeConfig(repo, {
      tagging: {
        for_packages: {
          enabled: true,
        },
      },
    })
    await repo.touch('touch src/desktop-product-header/new_file', 'cc')

    await runScript(repo, 'pvm update')

    expect(repo.pkgTags()).toEqual([
      'desktop-product-header-v1.1.0',
    ])
  })

  it.concurrent('автоматические изменение зависимых пакетов', async () => {
    const repo = await initRepo('mono-auto-deps', {
      tagging: {
        for_packages: {
          enabled: true,
        },
      },
    })
    await repo.touch('src/desktop-product-header/new_file', 'change header')
    await repo.runScript('pvm update')

    expect(repo.pkgTags()).toEqual([
      'a-v1.0.1',
      'd-v1.0.1',
      'desktop-product-footer-v2.0.1',
      'desktop-product-header-v1.0.0',
    ])

    expect(repo.pkgVersion('src/a')).toEqual('1.0.1')
    expect(repo.readPkg('src/a').dependencies).toEqual({
      '@tinkoff-boxy/desktop-product-header': '1.0.0',
      'd': '^1.0.1',
    })

    expect(repo.pkgVersion('src/desktop-product-footer')).toEqual('2.0.1')
  })

  it.concurrent('versioning.source = tag, should correctly add semver tag for unified repo', async () => {
    const repo = await initRepo('monouno', {
      tagging: {
        for_packages: {
          enabled: true,
        },
      },
      versioning: {
        source: 'tag',
      },
    })
    await repo.tag('v1.0.0')
    await repo.touch('src/a/new_file', 'change header')
    await repo.runScript('pvm update')

    expect(repo.lastReleaseTag()).toEqual('v1.1.0')

    expect(repo.pkgVersion('src/a')).toEqual('0.0.0-stub') // should replaced to stub version
    expect(repo.pkgVersion('src/b')).toEqual('0.0.0-stub') // should replaced to stub version
    expect(repo.readPkg('src/b').dependencies).toEqual({
      'a': '0.0.0-stub',
    }) // dependencies should replaced to stub version too
  })

  it.concurrent('versioning.source = tag, should correctly add tags for new versions', async () => {
    const repo = await initRepo('monouno', {
      tagging: {
        for_packages: {
          enabled: true,
        },
      },
      versioning: {
        source: 'tag',
        unified_versions_for: [],
      },
    })
    await repo.tag('a-v1.0.0')
    await repo.tag('b-v1.0.0')
    await repo.tag('c-v1.0.0')
    await repo.touch('src/a/new_file', 'change header')
    await repo.runScript('pvm update')

    expect(repo.pkgTags()).toEqual([
      'a-v1.1.0',
      'b-v1.0.1',
    ])

    expect(repo.pkgVersion('src/a')).toEqual('0.0.0-stub') // should replaced to stub version
    expect(repo.pkgVersion('src/b')).toEqual('0.0.0-stub') // should replaced to stub version
    expect(repo.readPkg('src/b').dependencies).toEqual({
      'a': '0.0.0-stub',
    }) // dependencies should replaced to stub version too
  })

  it.concurrent('update reason for always_changed_workspaces', async () => {
    const acwPath = writeRepo({ name: 'acw', spec: 'src/a@1.0.0,src/b@1.0.0,src/c@1.0.0' })
    const repo = await initRepo(acwPath, {
      release_list: {
        enabled: true,
      },
      dangerously_opts: {
        always_changed_workspaces: [ 'src/a' ],
      },
    })

    await repo.touch('src/b/nf', 'change nf')
    await repo.runScript('pvm update')
    expect(repo.existsPath('releaseList.json')).toBeTruthy()
    const releaseList = JSON.parse(repo.readFile('releaseList.json'))

    expect(releaseList).toHaveLength(1)
    expect(releaseList[0].packages).toHaveLength(2)

    const forcedPackage = releaseList[0].packages.find(pkg => pkg.name === 'a')
    expect(forcedPackage).toBeDefined()
    expect(forcedPackage.updateReason).toEqual('always_changed')
  })

  it.concurrent('update reason for force released package', async () => {
    const repoPath = await writeRepo({ name: 'force_release', spec: 'src/a@1.0.0,src/b@1.0.0,src/c@1.0.0' })
    const repo = await initRepo(repoPath, {
      release_list: {
        enabled: true,
      },
    })

    await repo.touch('src/b/nf', 'change nf')
    await repo.writeFile(
      'update-hints.toml',
      dedent`
        [force-release]
        packages = [
          'a',
        ]
      `,
      'uh'
    )
    await repo.runScript('pvm update')
    expect(repo.existsPath('releaseList.json')).toBeTruthy()
    const releaseList = JSON.parse(repo.readFile('releaseList.json'))

    expect(releaseList).toHaveLength(1)
    expect(releaseList[0].packages).toHaveLength(2)

    const forcedPackage = releaseList[0].packages.find(pkg => pkg.name === 'a')
    expect(forcedPackage).toBeDefined()
    expect(forcedPackage.updateReason).toEqual('hints')
  })

  it.concurrent('versioning.source = file should work', async () => {
    const repo = await initRepo('mono-auto-deps', {
      versioning: {
        source: 'file',
        source_file: 'versions.json',
      },
    })
    await repo.touch('src/desktop-product-header/new_file', 'change header')
    await repo.runScript('pvm update')

    const versions = JSON.parse(repo.readFile('versions.json'))
    expect(versions).toEqual({
      'a': '1.0.1',
      'd': '1.0.1',
      '@tinkoff-boxy/desktop-product-footer': '2.0.1',
      '@tinkoff-boxy/desktop-product-header': '1.0.0',
      'r': '1.0.0', // not changed
    })

    expect(repo.pkgVersion('src/a')).toEqual('0.0.0-stub') // should replaced to stub version
    expect(repo.pkgVersion('src/desktop-product-footer')).toEqual('0.0.0-stub') // should replaced to stub version
    expect(repo.readPkg('src/a').dependencies).toEqual({
      '@tinkoff-boxy/desktop-product-header': '0.0.0-stub',
      'd': '^0.0.0-stub',
    }) // dependencies should replaced to stub versions too
  })

  // aa -> b, aa -> d, b -> c, d -> c
  // a[major], c[minor]
  it.concurrent('обновление зависимых пакетов, схема 2', async () => {
    const repo = await initRepo('mono-dependants-2', {
      core: {
        deps_keys: [
          'dependencies',
          'devDependencies',
        ],
      },
      tagging: {
        for_packages: {
          enabled: true,
        },
      },
    })

    await repo.touch([
      'src/a/nf',
      'src/c/nf',
    ], 'update a and c')

    await runScript(repo, 'pvm update')

    expect(repo.pkgTags()).toEqual([
      'a-v2.0.0',
      'aa-v1.0.1',
      'b-v2.0.1',
      'c-v3.1.0',
      'd-v1.0.1',
    ])

    expect(repo.readPkg('src/aa').dependencies).toEqual({
      'b': '2.0.1',
    })

    expect(repo.readPkg('src/aa').devDependencies).toEqual({
      'd': '1.0.1',
    })
  })

  it.concurrent('должен учитываться release type от зависимостей и браться максимально из возможных', async () => {
    const repo = await initRepo('monorepo-new', {
      tagging: {
        for_packages: {
          enabled: true,
        },
      },
    })
    await repo.writeFile(
      'update-hints.toml',
      dedent`
        [release-types]
        major = [ 'a' ]

        [[update-dependants-for]]
        match = [ 'a' ]
        release-type = 'as-dep'
      `,
      'uh'
    )
    await repo.touch('src/{a,b,c}/nf', 'change a, b and c')

    await repo.runScript('pvm update')

    expect(repo.pkgTags()).toEqual([
      'a-v2.0.0',
      'b-v3.0.0',
      'c-v1.0.0',
    ])
  })

  it.concurrent('hints-file release-types должен учитываться, и иметь приоритет выше чем у commit messages', async () => {
    const repo = await initRepo('mono-up-hints-simple', doTagsButNotDependantsPlease)
    await repo.touch('src/a/nf', 'fix: change a')
    await repo.touch('src/c/nf', 'change c')

    await repo.runScript('pvm update')

    expect(repo.pkgTags()).toEqual([
      'a-v2.0.0',
      'c-v3.0.1',
    ])

    expect(() => {
      repo.shell('test -f update-hints.toml')
    }).toThrow()
  })

  it.concurrent('hints-file update-dependants должен учитываться, для обновления зависимых пакетов выборочно', async () => {
    const repo = await initRepo('mono-dependants-hints', deepMerge({
      update: {
        dependants_release_type: 'minor',
      },
    }, doTagsPlease))
    await repo.touch('src/{c,d}/nf', 'update c and d')
    await repo.runScript('pvm update')

    expect(repo.pkgTags()).toEqual([
      'a-v1.1.0',
      'b-v2.1.0',
      'c-v3.1.0',
      'd-v1.1.0',
    ])
  })

  it.concurrent('обновление монорепы с хинтами на зависимых и циклической зависимостью', async () => {
    const repo = await initRepo('mono-circular-deps', doTagsPlease)
    await repo.touch('src/b/nv', 'update b')

    await repo.runScript('pvm update')

    expect(repo.pkgTags()).toEqual([
      'a-v1.0.1',
      'b-v2.1.0',
      'c-v3.0.1',
      'd-v1.0.1',
    ])
  })

  it.concurrent('update-dependants при обновлении двух зависимостей as-dep выбирает максимальную для депенданта', async () => {
    const repo = await initRepo('mono-update-as-dep', doTagsPlease)
    await repo.touch('src/c/nf', 'update c')
    await repo.touch('src/m/nf', 'update m')

    await repo.runScript('pvm update')

    expect(repo.pkgTags()).toEqual([
      'a-v2.0.0',
      'b-v3.0.0',
      'c-v3.1.0',
      'm-v2.0.0',
    ])
  })

  it.concurrent('should pass dependants update through respect_zero_major_version logic', async () => {
    const repo = await initRepo('mono-conventional-c', {
      versioning: {
        unified: [
          '/src/a',
          '/src/b',
        ],
        source: 'tag',
      },
      update: {
        autolint: false,
        respect_zero_major_version: true,
        dependants_release_type: 'as-dep',
        include_uncommited: true,
      },
    })
    await repo.linkNodeModules()

    await repo.updatePkg('src/a', {
      dependencies: {
        'c': '^0.0.0-stub',
      },
    })
    await repo.tag('v0.1.0')
    await repo.tag('c-v1.0.0')
    await repo.touch('src/c/nf', `feat: minor up`)

    const { newVersions, repo: innerRepo } = await repo.getUpdateState()
    expect(newVersions.get(innerRepo.pkgset.get('a'))).toBe('0.1.1')
  })

  it('обновление депендантов на преминор не должно ломать yarn install', async () => {
    const repo = await initRepo('mono-pre-deps')
    await repo.touch('src/c/nf', 'update c')

    await runScript(repo, 'pvm update')
    await runScript(repo, 'yarn')
  })

  it.concurrent('обновление пакетов на которые есть не semver ссылки', async () => {
    const repo = await initRepo('mono-prerel-deps')
    await repo.touch('src/{a,b,c}/nf', 'update c, b and a')

    await repo.runScript('pvm update -p print')
  })

  it.concurrent('обновление только части зависимых пакетов не должно ломать package.json', async () => {
    const repo = await initRepo('m-update-subset-dependants', doTagsButNotDependantsPlease)
    await repo.writeFile(
      'update-hints.toml',
      dedent`
        update-dependants-for = [ 'a' ]
      `
    )
    await repo.touch('src/{a,e}/nf')
    await repo.commitAll('update hints, change a and e')

    await repo.runScript('pvm update')
    const cDep = repo.readPkg('src/b').dependencies.c

    expect(cDep).toEqual('1.3.0')
  })

  it.concurrent('should not fail with root without version', async () => {
    const repo = await initRepo('monorepo-new', {
      update: {
        include_root: true,
      },
    })

    await repo.touch(['foobar', 'src/a/nf'], 'changes')
    await repo.runScript('pvm update')
  })

  it.concurrent('no workspaces, simple update', async () => {
    const repo = await initRepo('two-releases', doTagsPlease)
    await repo.touch('foobar', 'just change repo')

    await repo.runScript('pvm update')
    expect(repo.tags()).toEqual([
      'v1.2.0',
    ])
    await repo.touch('abc', 'newchange')
    await repo.runScript('pvm update')

    expect(repo.tags()).toEqual([
      'v1.3.0',
    ])
  })

  it.concurrent('mutually exclusive commits should not generate false-positive changes', async () => {
    const repo = await initRepo('monorepo-new', doTagsButNotDependantsPlease)
    await repo.touch('src/a/n', 'change-a')
    await repo.touch('src/b/tmp', 'change-b')

    await repo.addPkg('src/new', {
      name: 'new',
      version: '1.0.0',
    })
    await repo.commitAll('new-pkg')
    await repo.touch('src/new/abc', 'change-new-pkg')

    await repo.runScript('git rm -rf src/new && git commit -am rm-new-pkg')
    await repo.runScript('git rm -f src/b/tmp && git commit -am revert-b')

    const { stdout } = await execScript(repo, 'pvm update -p print -P format=%n')
    expect(stdout.split('\n').slice(0, -1)).toEqual([
      'a',
    ])
  })

  it.concurrent('include-uncommited should track uncommited changes too', async () => {
    const repo = await initRepo('monorepo-new', {
      update: {
        update_dependants: false,
        include_uncommited: true,
      },
    })
    await repo.touch('src/a/a', 'change-a')
    await repo.touch('src/b/bb')
    await repo.touch('src/c/ccc')

    await runScript(repo, 'mkdir src/new && cat > src/new/package.json', {
      input: JSON.stringify({ name: 'new', version: '1.0.0' }, null, 2),
    })

    const { stdout } = await execScript(repo, 'pvm update -p print -P format=%n')
    expect(stdout.split('\n').slice(0, -1).sort()).toEqual([
      'a',
      'b',
      'c',
      'new',
    ])
  })

  it.concurrent('include-uncommited should track uncommited changes too, dirty state without new commits', async () => {
    const repo = await initRepo('monorepo-new', {
      update: {
        update_dependants: false,
        include_uncommited: true,
      },
    })
    await repo.touch('src/c/ccc')

    await runScript(repo, 'mkdir src/new && cat > src/new/package.json', {
      input: JSON.stringify({ name: 'new', version: '1.0.0' }, null, 2),
    })

    const { stdout } = await execScript(repo, 'pvm update -p print -P format=%n')
    expect(stdout.split('\n').slice(0, -1).sort()).toEqual([
      'c',
      'new',
    ])
  })

  it('snapshot for originReleaseNotes of pvm update', async () => {
    const repo = await initRepo('monorepo-new', doPkgNotedTags)
    await repo.touch('src/a/a', 'change-a')

    await runScript(repo, 'pvm update')

    expect(repo.tagNotes('b-v2.0.1')).toMatchSnapshot()
  })

  it('generate graph for new package should not fail', async () => {
    const repo = await initRepo('monorepo-new')

    await repo.addPkg('src/new', {
      name: 'new',
      version: '1.0.0',
    })
    await repo.commitAll('add new package')

    const { stdout: dotContents } = await repo.execScript('pvm update -p dot')

    expect(dotContents).toMatchSnapshot()
  })

  it.concurrent('release-type section in update-hints should override release-type for all packages', async () => {
    const repo = await initRepo('monorepo-new')

    const updateHints = dedent`
      release-type = 'major'
    `

    await repo.writeFile('update-hints.toml', updateHints, 'add-update-hints')
    await repo.touch(['src/a/nf', 'src/b/nf'], 'change a and b')

    await repo.runScript('pvm update')

    expect(repo.pkgVersion('src/a')).toEqual(('2.0.0'))
    expect(repo.pkgVersion('src/b')).toEqual(('3.0.0'))
  })

  it.concurrent(`should not generate package changelog if it has not been changed`, async () => {
    const repo = await initRepo('monorepo-new', {
      changelog: {
        for_packages: {
          enabled: true,
          output_dir: 'changelogs',
        },
      },
    })

    await repo.touch(['src/a/nf', 'src/b/nf'], 'change a and b')
    await repo.runScript('pvm update')

    const aChangelog = repo.shell('cat changelogs/a.md')
    const bChangelog = repo.shell('cat changelogs/b.md')
    expect(aChangelog).not.toEqual('')
    expect(bChangelog).not.toEqual('')

    await repo.touch(['src/b/nf-2', 'src/c/nf'], 'change b and c')
    await repo.runScript('pvm update')

    expect(repo.shell('cat changelogs/a.md')).toEqual(aChangelog)
    expect(repo.shell('cat changelogs/b.md')).not.toEqual(aChangelog)
  })

  it.concurrent('should generate changelog for new changed packages in second release', async () => {
    const repo = await initRepo('monorepo-new', {
      changelog: {
        for_packages: {
          enabled: true,
          output_dir: 'changelogs',
        },
      },
    })

    await repo.touch(['src/a/nf', 'src/b/nf'], 'change a and b')
    await repo.runScript('pvm update')

    await repo.touch(['src/b/nf-2', 'src/c/nf'], 'change b and c')
    await repo.runScript('pvm update')

    expect(repo.shell('cat changelogs/c.md')).not.toEqual('')
    expect(repo.shell('git ls-files changelogs/c.md')).not.toEqual('')
  })

  it.concurrent('should take into account release files in workspaces', async () => {
    const repo = await initRepo('monorepo-new')
    await repo.touch('src/a/major', 'major for a')
    await repo.touch('src/b/patch', 'patch for b')

    await repo.runScript('pvm update')

    expect(repo.pkgVersion('src/a')).toEqual('2.0.0')
    expect(repo.pkgVersion('src/b')).toEqual('2.0.1')

    expect(repo.existsPath('src/a/major')).toBe(false)
    expect(repo.existsPath('src/b/patch')).toBe(false)
  })

  it.concurrent('should take into account none release file and detele them in the end', async () => {
    const repo = await initRepo('monorepo-new')
    await repo.touch('src/a/foobar', 'change a')
    await repo.touch('src/a/none', 'none file for a')

    await repo.runScript('pvm update')

    expect(repo.pkgVersion('src/a')).toEqual('1.0.0')

    expect(repo.existsPath('src/a/none')).toBe(false)
  })

  it.concurrent('skip alias for release type none', async () => {
    const repo = await initRepo('monorepo-new')
    await repo.touch('src/a/foobar', 'change a')
    await repo.touch('src/a/skip', 'skip file for a')

    await repo.runScript('pvm update')

    expect(repo.pkgVersion('src/a')).toEqual('1.0.0')

    expect(repo.existsPath('src/a/skip')).toBe(false)
  })

  it.concurrent('must not change version when it was changed manually', async () => {
    const repo = await initRepo('monorepo-new')

    // standard case
    expect(repo.pkgVersion('src/a')).toEqual('1.0.0')
    await repo.touch('src/a/foobar', 'change a')
    await repo.runScript('pvm update')
    expect(repo.pkgVersion('src/a')).toEqual('1.1.0')

    // manual case
    await repo.updatePkg('src/a', { version: '2.54.456' })
    await repo.commitAll('update package.json manually')
    await repo.runScript('pvm update')
    expect(repo.pkgVersion('src/a')).toEqual('2.54.456')
  })

  it.concurrent('should override release type by release_type_overrides config', async () => {
    const repo = await initRepo('monorepo-new', {
      update: {
        release_type_overrides: [
          {
            type: 'none',
            files_match: ['**/__*__/**'],
          },
          {
            type: 'major',
            files_match: ['**/*.md'],
          },
        ],
      },
    })

    const aVersion = repo.pkgVersion('src/a')
    const bVersion = repo.pkgVersion('src/b')
    await repo.touch(['src/a/__tests__/*.md', 'src/b/foo.md'], 'update a')
    await repo.runScript('pvm update')
    expect(repo.pkgVersion('src/a')).toEqual(aVersion)
    expect(repo.pkgVersion('src/b')).toEqual(semver.inc(bVersion, 'major'))
  })

  it.concurrent('should respect tag-only option', async () => {
    const repoPath = writeRepo({ name: 'indep', spec: 'src/a@1.0.0,src/b@1.0.0,src/c@1.0.0' })
    const repo = await initRepo(repoPath, {
      versioning: {
        unified: true,
        source: 'tag',
      },
      update: {
        autolint: true,
      },
      release: {
        tag_only: true,
        disable_changelog: false,
      },
    })

    await repo.touch('src/a/nf', 'change a')

    const refBeforeUpdate = repo.head

    await repo.runScript('pvm update')

    expect(refBeforeUpdate).toStrictEqual(repo.head)
  })

  it.concurrent('[PVM-213] should put tag on commit in current branch when source=tag and tag_only=true', async () => {
    const repoPath = writeRepo({ name: 'simple-one', spec: 'src/a@1.0.0' })
    const repo = await initRepo(repoPath, {
      versioning: {
        unified: true,
        source: 'tag',
      },
      release: {
        tag_only: true,
      },
    })

    await repo.execScript('git checkout -b dev')
    await repo.touch('src/a/nf', 'change a')

    await repo.runScript('pvm update')

    const lastReleaseTag = repo.lastReleaseTag()
    const { stdout: tagRef } = await repo.execScript(`git rev-list -1 ${lastReleaseTag}`)
    const { stdout: devLastCommitRef } = await repo.execScript(`git rev-parse HEAD`)

    expect(tagRef).toStrictEqual(devLastCommitRef)
  })

  it.concurrent('should not write root pkg to versions.json file', async () => {
    const repo = await initRepo('monostub', {
      changelog: {
        enabled: false,
      },
    })
    const rootPkg = JSON.parse(repo.readFile('package.json'))

    await repo.writeFile('package.json', JSON.stringify({
      ...rootPkg,
      version: '0.0.0',
    }), 'add version to root package')

    await repo.runScript('pvm update')

    expect(JSON.parse(repo.readFile('versions.json'))).toEqual({
      a: '1.0.0',
      b: '1.0.1',
      c: '1.1.0',
    })
  })

  it.concurrent('should work in initially empty repo', async () => {
    const repo = await initRepo('empty', {
      versioning: {
        source: 'tag',
      },
    }, { empty: true })
    await repo.writeFile(
      'package.json',
      JSON.stringify({ name: 'empty', initialVersion: '0.1.0' }),
      'make root pkg json'
    )

    await repo.runScript('pvm update')
    expect(repo.lastReleaseTag()).toEqual('v0.1.0')
  })

  it.concurrent('should deepen local git tree if no common commit found and git repo is shallow', async () => {
    const remoteRepoDir = writeRepo({
      name: 'remote-repo',
      version: '1.0.0',
      spec: [],
    })
    const repo = await initRepo(remoteRepoDir)

    // prepare branches for shallow clone with depth=1
    await repo.touch('a', 'make "a"')
    await repo.touch('b', 'make "b"')
    await repo.touch('c', 'make "c"')
    await repo.annotatedTag('v1.0.0', 'Initial release')

    await repo.runScript('git checkout HEAD~2')
    await repo.runScript('git checkout -b branchFromA')
    await repo.touch('d', 'make "d"')
    await repo.runScript('git checkout master')
    await repo.runScript('git merge branchFromA')

    // cloning shallow copy of prepared remote
    const shallowRepoPath = path.join(reposDir, 'shallow-repo')
    await runShell(`git clone --depth 3 file://${remoteRepoDir} ${shallowRepoPath}`)
    const shallowRepo = await initRepo(shallowRepoPath, {
      versioning: {
        source: 'tag',
        unified: true,
      },
      release_list: {
        enabled: true,
      },
      release: {
        tag_only: true,
      },
    })
    const { stdout: beforeGitLog } = await shallowRepo.execScript(`git log --format=%s HEAD^1..HEAD`)
    expect(beforeGitLog.trim()).toEqual(`Merge branch 'branchFromA'
make "d"
make "a"`)

    await shallowRepo.runScript(`pvm update`)
    const { stdout: afterGitLog } = await shallowRepo.execScript(`git log --format=%s HEAD^1..HEAD`)
    expect(afterGitLog.trim()).toEqual(`Merge branch 'branchFromA'
make "d"`)
    const releaseList = JSON.parse(shallowRepo.readFile('releaseList.json'))
    expect(releaseList[0].description).toEqual('make "d"\n')
  })

  describe('single-repo, source=tag, root pkg is private', () => {
    it.concurrent('initial version on initial release', async () => {
      const repo = await initRepo('empty', {
        versioning: {
          source: 'tag',
        },
      }, { empty: true })
      await repo.writeFile(
        'package.json',
        JSON.stringify({ name: 'empty', private: true, version: '0.0.0' }),
        'make root pkg json'
      )

      await repo.runScript('pvm update')
      expect(repo.lastReleaseTag()).toEqual('v0.0.1')
    })

    it.concurrent('increment version if release already exists', async () => {
      const repo = await initRepo('empty', {
        versioning: {
          source: 'tag',
        },
      }, { empty: true })
      await repo.writeFile(
        'package.json',
        JSON.stringify({ name: 'empty', private: true, version: '0.0.0' }),
        'make root pkg json'
      )

      await repo.tag('v0.1.0')

      await repo.touch('a', 'change to create release')

      await repo.runScript('pvm update')

      expect(repo.lastReleaseTag()).toEqual('v0.2.0')
    })
  })

  describe('mono-repo, source=tag, root pkg is private, release tag format vX.X.X', () => {
    it.concurrent('initial version on initial release', async () => {
      const repoPath = writeRepo({ name: 'empty-mono-repo', version: '0.0.0', private: true, spec: 'src/a@1.0.0,src/b@1.0.0' })
      const repo = await initRepo(repoPath, {
        versioning: {
          source: 'tag',
          per_package: false,
          unified_versions_for: ['*'],
        },
      })
      await repo.touch('a', 'change to create release')
      await repo.runScript('pvm update')
      expect(repo.lastReleaseTag()).toEqual('v0.1.0')
    })

    it.concurrent('increment version if release already exists', async () => {
      const repoPath = writeRepo({ name: 'empty-mono-repo', version: '0.0.0', private: true, spec: 'src/a@1.0.0,src/b@1.0.0' })
      const repo = await initRepo(repoPath, {
        versioning: {
          source: 'tag',
          per_package: false,
          unified_versions_for: ['*'],
        },
      })

      await repo.touch('a', 'change to create release')
      await repo.runScript('pvm update')
      await repo.touch('b', 'change to create release')
      await repo.runScript('pvm update')

      expect(repo.lastReleaseTag()).toEqual('v0.2.0')
    })
  })

  describe('unified, source=tag', () => {
    it.concurrent('first release with unified setting enabled', async () => {
      const repo = await initRepo('monorepo-new', {
        versioning: {
          unified: true,
          source: 'tag',
        },
        update: {
          autolint: false,
        },
      })

      await repo.touch('src/b/nf')
      await repo.commit('change b')
      await repo.runScript('pvm update')

      expect(repo.lastReleaseTag()).toEqual('v0.1.0')
    })

    it.concurrent('should increase semver tag in case editing MUG', async () => {
      const repoPath = writeRepo({ name: 'indep', spec: 'src/a@1.0.0,src/b@1.0.0,src/c@1.0.0' })
      const repo = await initRepo(repoPath, {
        versioning: {
          unified: true,
          source: 'tag',
          unified_versions_for: [['b', 'c']],
        },
        update: {
          autolint: false,
        },
      })

      await repo.tag('v2.0.0')

      await repo.touch('src/a/nf', 'change MUG')
      await repo.runScript('pvm update')

      const lastReleaseTag = repo.lastReleaseTag()
      expect(lastReleaseTag).toEqual('v2.1.0')
    })

    it.concurrent(`new package in MUG`, async () => {
      const repoPath = writeRepo({ name: 'new_mug', spec: 'src/a@1.0.0,src/b@1.0.0,src/c@1.0.0' })
      const repo = await initRepo(repoPath, {
        versioning: {
          unified: true,
          source: 'tag',
          unified_versions_for: [['b', 'c']],
        },
        update: {
          autolint: false,
        },
      })

      await repo.annotatedTag('v0.44.1', `release\n\n---\nb@2.1.1\nc@2.1.1`)

      await repo.addPkg('src/new', {
        name: 'new',
        version: '1.0.0',
      })
      await repo.commitAll('added new pkg')
      await repo.runScript('pvm update')

      const lastReleaseTag = repo.lastReleaseTag()
      expect(lastReleaseTag).toEqual('v0.45.0')
      expect((await repo.loadPkg('src/new')).version).toEqual('0.45.0')
    })

    it.concurrent('new package in SUG', async () => {
      const repoPath = writeRepo({ name: 'new_sug', spec: 'src/a@1.0.0,src/b@1.0.0,src/c@1.0.0' })
      const repo = await initRepo(repoPath, {
        versioning: {
          unified: true,
          source: 'tag',
          unified_versions_for: [['b', 'c', 'new']],
        },
        update: {
          autolint: false,
        },
      })

      await repo.annotatedTag('v2.0.0', `release\n\n---\nb@0.44.1\nc@0.44.1`)

      await repo.addPkg('src/new', {
        name: 'new',
        version: '1.0.0',
      })
      await repo.commitAll('added new pkg')
      await repo.runScript('pvm update')

      const lastReleaseTag = repo.lastReleaseTag()
      expect(lastReleaseTag).toEqual('v2.0.0#Silver-Fox')
      expect((await repo.loadPkg('src/new')).version).toEqual('0.45.0')
      expect((await repo.loadPkg('src/b')).version).toEqual('0.45.0')
    })

    it.concurrent('SUG with release_tag_package', async () => {
      const repo = await initRepo('monorepo-new', {
        versioning: {
          unified: true,
          source: 'tag',
          release_tag_package: 'c',
        },
        update: {
          autolint: false,
        },
      })

      await repo.annotatedTag('v0.1.0', `release by pvm

---
a@0.1.0
b@0.1.0
c@0.1.0`)

      await repo.writeFile('src/b/some.txt', 'some', 'changes')
      await repo.runScript('pvm update')

      const lastReleaseTag = repo.lastReleaseTag()
      expect(lastReleaseTag).toEqual('v0.2.0')
      expect((await repo.loadPkg('src/a')).version).toEqual('0.2.0')
      expect((await repo.loadPkg('src/b')).version).toEqual('0.2.0')
      expect((await repo.loadPkg('src/c')).version).toEqual('0.2.0')
    })

    it.concurrent('move pkg from SUG to MUG', async () => {
      const repoPath = writeRepo({ name: 'new_sug', spec: 'src/a@1.0.0,src/b@1.0.0,src/c@1.0.0,src/d@1.0.0' })
      const repo = await initRepo(repoPath, {
        versioning: {
          unified: true,
          source: 'tag',
          unified_versions_for: [['c', 'd']],
        },
        update: {
          autolint: false,
        },
      })

      await repo.annotatedTag('v0.44.1', `release\n\n---\nc@2.1.1\nd@2.1.1`)

      await repo.updateConfig({
        versioning: {
          unified_versions_for: [['d']],
        },
      })

      await repo.touch('src/c/nf', 'touch c')
      await repo.runScript('pvm update')

      const lastReleaseTag = repo.lastReleaseTag()
      expect(lastReleaseTag).toEqual('v0.45.0')
      expect((await repo.loadPkg('src/c')).version).toEqual('0.45.0')
      expect((await repo.loadPkg('src/d')).version).toEqual('2.1.1')
    })

    it.concurrent('move package from MUG to SUG', async () => {
      const repoPath = writeRepo({ name: 'new_sug', spec: 'src/a@1.0.0,src/b@1.0.0,src/c@1.0.0,src/d@1.0.0' })
      const repo = await initRepo(repoPath, {
        versioning: {
          unified: true,
          source: 'tag',
          unified_versions_for: [['c', 'd']],
        },
        update: {
          autolint: false,
        },
      })

      await repo.annotatedTag('v2.1.1', `release\n\n---\nc@0.44.1\nd@0.44.1`)

      await repo.updateConfig({
        versioning: {
          unified_versions_for: [['b', 'c', 'd']],
        },
      })

      await repo.touch('src/b/nf', 'touch b')
      await repo.runScript('pvm update')

      const lastReleaseTag = repo.lastReleaseTag()
      expect(lastReleaseTag).toEqual(expect.stringMatching(/^v2.1.1/))
      expect((await repo.loadPkg('src/a')).version).toEqual('2.1.1')
      expect((await repo.loadPkg('src/b')).version).toEqual('0.45.0')
      expect((await repo.loadPkg('src/d')).version).toEqual('0.45.0')
    })

    // на данный момент кейс не поддерживается
    it.skip('move package from SUG1 to SUG2', async () => {
      const repoPath = writeRepo({ name: 'sugs', spec: 'src/a@1.0.0,src/b@1.0.0,src/c@1.0.0,src/d@1.0.0' })
      const repo = await initRepo(repoPath, {
        versioning: {
          unified: true,
          source: 'tag',
          unified_versions_for: [['b', 'c'], ['d']],
        },
        update: {
          autolint: false,
        },
      })

      await repo.annotatedTag('v10.20.30', `release\n\n---\nb@2.1.1\nc@2.1.1\nd@0.44.1`)

      await repo.updateConfig({
        versioning: {
          unified_versions_for: [['b'], ['c', 'd']],
        },
      })

      await repo.touch('src/c/nf', 'touch c')
      await repo.runScript('pvm update')

      const lastReleaseTag = repo.lastReleaseTag()
      expect(lastReleaseTag).toEqual(expect.stringMatching(/^v10.20.30/))
      expect((await repo.loadPkg('src/b')).version).toEqual('2.1.1')
      expect((await repo.loadPkg('src/c')).version).toEqual('0.45.0')
      expect((await repo.loadPkg('src/d')).version).toEqual('0.45.0')
    })

    it.concurrent('packages from SUG should have own versioning', async () => {
      const repoPath = writeRepo({ name: 'sugown', spec: 'src/a@1.0.0,src/b@1.0.0,src/c@1.0.0' })
      const repo = await initRepo(repoPath, {
        versioning: {
          unified: true,
          source: 'tag',
          unified_versions_for: [['b', 'c']],
        },
        update: {
          autolint: false,
        },
      })

      await repo.annotatedTag('v2.0.0', 'release\n\n---\nb@0.44.1\nc@0.44.1')

      await repo.touch('src/b/nf', 'change b')
      await repo.runScript('pvm update')

      // fs versions should stay same
      expect(repo.pkgVersion('src/a')).toEqual('1.0.0')
      expect(repo.pkgVersion('src/b')).toEqual('1.0.0')
      expect(repo.pkgVersion('src/c')).toEqual('1.0.0')

      const lastReleaseTag = repo.lastReleaseTag()
      expect(lastReleaseTag).toEqual(expect.stringMatching(/^v2\.0\.0#.*/))
      expect(repo.getTagAnnotation(lastReleaseTag)).toEqual(expect.stringMatching(/.*\n---\nb@0.45.0\nc@0.45.0\s*$/))
      expect((await repo.loadPkg('src/a')).version).toEqual('2.0.0')
      expect((await repo.loadPkg('src/b')).version).toEqual('0.45.0')
      expect((await repo.loadPkg('src/c')).version).toEqual('0.45.0')
    })

    it('independent packages should have own versioning', async () => {
      const repoPath = writeRepo({ name: 'indep', spec: 'src/a@1.0.0,src/b@1.0.0,src/c@1.0.0' })
      const repo = await initRepo(repoPath, {
        versioning: {
          unified: true,
          source: 'tag',
          independent_packages: ['b', 'c'],
        },
        update: {
          autolint: false,
        },
      })

      await repo.tag('v2.0.0')

      await repo.touch('src/b/nf', 'change b')
      await repo.runScript('pvm update')

      // fs versions should stay same
      expect(repo.pkgVersion('src/a')).toEqual('1.0.0')
      expect(repo.pkgVersion('src/b')).toEqual('1.0.0')
      expect(repo.pkgVersion('src/c')).toEqual('1.0.0')

      const lastReleaseTag = repo.lastReleaseTag()
      expect(lastReleaseTag).toEqual(expect.stringMatching(/^v2\.0\.0#.*/))
      expect(repo.getTagAnnotation(lastReleaseTag)).toEqual(expect.stringMatching(/.*\n---\nb@0.1.0\nc@0.0.1\s*$/))
      expect((await repo.loadPkg('src/a')).version).toEqual('2.0.0')
      expect((await repo.loadPkg('src/b')).version).toEqual('0.1.0')
      expect((await repo.loadPkg('src/c')).version).toEqual('0.0.1')
    })

    it.concurrent('should take root pkg name for release annotation', async () => {
      const repoPath = writeRepo({ name: 'indep', spec: 'src/a@1.0.0,src/b@1.0.0,src/c@1.0.0' })
      const repo = await initRepo(repoPath, {
        versioning: {
          unified: true,
          source: 'tag',
          independent_packages: ['b', 'c'],
        },
        update: {
          autolint: false,
        },
      })

      await repo.tag('v2.0.0')

      await repo.touch('src/b/nf', 'change b')
      await repo.runScript('pvm update')

      // fs versions should stay same
      expect(repo.pkgVersion('src/a')).toEqual('1.0.0')
      expect(repo.pkgVersion('src/b')).toEqual('1.0.0')
      expect(repo.pkgVersion('src/c')).toEqual('1.0.0')

      const lastReleaseTag = repo.lastReleaseTag()
      expect(repo.getTagAnnotation(lastReleaseTag)).toEqual(expect.stringMatching(new RegExp(`^${(await repo.loadPkg('.')).name}`)))
    })

    it.concurrent('should take unified packages by pattern', async () => {
      const repoPath = writeRepo({
        name: 'unipattern',
        spec: [
          'src/a@1.0.0',
          'src/b@1.0.0',
          'src/c@1.0.0',
          'main/m@1.0.0',
          'main/tool@0.0.0-stub',
          'tools/x@0.0.0-stub',
          'tools/y@0.0.0-stub',
        ],
      })
      const repo = await initRepo(repoPath, {
        versioning: {
          unified: ['/src/*', '/main/*'],
          source: 'tag',
          unified_versions_for: [['/tools/*', 'tool']],
          independent_packages: ['c'],
        },
        update: {
          autolint: false,
        },
      })
      await repo.annotatedTag('v2.0.0', 'release\n\n---\nc@0.44.1\ntool@0.5.0\nx@0.5.0\ny@0.5.0')

      await repo.touch('main/tool/nf', 'touch main tool')
      await repo.runScript('pvm update')

      expect((await repo.loadPkg('src/a')).version).toEqual('2.0.0')
      expect((await repo.loadPkg('src/b')).version).toEqual('2.0.0')
      // independent_packages > unified
      expect((await repo.loadPkg('src/c')).version).toEqual('0.44.1')
      // unified_versions_for > unified
      expect((await repo.loadPkg('main/tool')).version).toEqual('0.6.0')
      expect((await repo.loadPkg('tools/x')).version).toEqual('0.6.0')
    })

    it.concurrent('should bump minor when breaking change and respect_zero_major_version applied', async () => {
      const repo = await initRepo('mono-conventional-c', {
        versioning: {
          unified: true,
          source: 'tag',
        },
        update: {
          autolint: false,
          respect_zero_major_version: true,
        },
      })
      await repo.linkNodeModules()

      await repo.tag('v0.1.0', `release
---
a@0.1.0
b@0.1.0
c@0.1.0
`)

      await repo.touch('src/a/nf', `fix: touch a

BREAKING CHANGE: do minor
`)

      const { newVersions, repo: innerRepo } = await repo.getUpdateState()
      const pkgA = innerRepo.pkgset.get('a')
      expect(newVersions.get(pkgA)).toBe('0.2.0')
    })
  })

  describe('unified groups', () => {
    it.concurrent('after adding new package should increment baseline version', async () => {
      const repo = await initRepo('monouno')

      await repo.addPkg('src/new', {
        name: 'new',
        version: '5.0.0',
      })
      await repo.commitAll('new-pkg')
      await repo.runScript('pvm update')

      expect(repo.pkgVersion('src/new')).toEqual('10.1.0')
      expect(repo.pkgVersion('src/a')).toEqual('10.1.0')
    })

    it.concurrent('should make one versions for new outdated packages', async () => {
      const repo = await initRepo('monouno')

      await repo.addPkg('src/new', {
        name: 'new',
        version: '5.0.0',
        dependencies: {
          a: '5.0.0',
        },
      })
      await repo.commitAll('new-pkg')
      await repo.runScript('pvm update')

      const newPkg = repo.readPkg('src/new')
      expect(newPkg.version).toEqual('10.1.0')
      expect(newPkg.dependencies.a).toEqual('10.1.0')

      expect(repo.pkgVersion('src/a')).toEqual('10.1.0')
    })

    it.concurrent('should pick correct version after changing outdated package', async () => {
      const repo = await initRepo('monouno')
      await repo.tag('v10.0.0', 'release')

      await repo.touch('src/a/nf', 'master change for v10.1.0')
      await repo.runScript('pvm update')
      expect(repo.pkgVersion('src/c')).toEqual('10.1.0')

      await repo.runScript('git checkout -b feature v10.0.0')
      await repo.touch('src/b/nf', 'feature change b')
      await repo.runScript('git checkout master && git merge feature')
      await repo.runScript('pvm update')

      const bPkg = repo.readPkg('src/b')
      expect(bPkg.version).toEqual('10.2.0')
      expect(bPkg.dependencies.a).toEqual('10.2.0')
    })

    it.concurrent('should correct handle multiple unified groups with dependencies between', async () => {
      const repo = await initRepo('ugroups', {
        versioning: {
          unified_versions_for: [
            '/src/*',
            '@utils/*',
          ],
        },
      })

      await repo.tag('release-01.01.2020', 'release')
      await repo.touch(['utils/baz/nf'], 'change baz')
      await repo.runScript('pvm update')

      expect(repo.pkgVersion('src/a')).toEqual('10.0.1')
      expect(repo.pkgVersion('src/b')).toEqual('10.0.1')
      expect(repo.pkgVersion('src/c')).toEqual('10.0.1')

      expect(repo.pkgVersion('utils/foo')).toEqual('1.1.0')
      expect(repo.pkgVersion('utils/bar')).toEqual('1.1.0')
      expect(repo.pkgVersion('utils/baz')).toEqual('1.1.0')
    })

    it.concurrent('should work release-type none for unified repos', async () => {
      const repo = await initRepo('monouno')

      await repo.tag('v10.0.0')
      const lastReleaseTag = repo.lastReleaseTag()
      expect(lastReleaseTag).toEqual('v10.0.0')

      await repo.touch('src/a/nf', 'change a')
      await repo.writeFile('update-hints.toml', `release-type = 'none'`, 'added update-hints')
      await repo.runScript('pvm update')

      expect(repo.lastReleaseTag()).toEqual('v10.0.0')
    })

    it(`unversioned package should not affect baseline version`, async () => {
      // @ts-ignore
      const repo = await initRepo('dedicated')
      // проверяем что все версии меньше 0
      const versions = JSON.parse(repo.readFile('versions.json'))
      expect(versions.a).toEqual(expect.stringMatching(/^0\./))
      expect(versions.b).toEqual(expect.stringMatching(/^0\./))
      expect(versions.c).toEqual(expect.stringMatching(/^0\./))
      await repo.tag(`v${versions.a}`)

      await repo.addPkg('src/new', {
        name: 'new',
        version: '0.0.0-stub',
      })
      await repo.commitAll('added new package')
      await repo.runScript('pvm update')

      const newVersions = JSON.parse(repo.readFile('versions.json'))

      expect(newVersions.new).toEqual(expect.stringMatching(/^0\./))
      expect(newVersions.a).not.toEqual(versions.a)
      expect(newVersions.a).toEqual(newVersions.new)
    })
  })

  describe('autolint', () => {
    it.concurrent('should include in release commit fixed packages', async () => {
      const repo = await initRepo('monostub', {
        update: {
          commit_via_platform: false,
          autolint: true,
        },
      })

      await repo.writeFile('src/c/package.json', JSON.stringify({
        ...repo.readPkg('src/c'),
        version: '10.0.0', // write invalid version
      }, null, 2), 'update c')

      await repo.tag('release-invalid-c')

      expect(repo.readPkg('src/c').version).toEqual('10.0.0')

      await repo.touch('src/b/newf', 'change b')
      await repo.runScript('pvm update')
      await repo.runScript('git reset --hard HEAD')

      expect(repo.readPkg('src/c').version).toEqual('0.0.0-stub')
    })

    it.concurrent('fallback in release should not affect autolint', async () => {
      const repo = await initRepo('monostub', {
        update: {
          commit_via_platform: false,
          autolint: true,
        },
      })

      await repo.writeFile('src/c/package.json', JSON.stringify({
        ...repo.readPkg('src/c'),
        version: '10.0.0', // write invalid version
      }, null, 2), 'update c')

      await repo.tag('release-invalid-c')

      expect(repo.readPkg('src/c').version).toEqual('10.0.0')

      await repo.touch('src/b/newf', 'change b')
      await repo.runScript('pvm update', {
        env: {
          '__PVM_TESTING_FAIL_PUSH_0001_TEST_CASE': 'true',
        },
      })

      expect(repo.readPkg('src/c').version).toEqual('0.0.0-stub')
    })

    it.concurrent('should move versions to separate file for new packages', async () => {
      const repo = await initRepo('monostub', {
        update: {
          commit_via_platform: false,
          autolint: true,
        },
      })
      await repo.addPkg('src/new', {
        name: 'new',
        version: '3.2.1',
      })
      await repo.commitAll('create packages')
      await repo.runScript('pvm update')

      const versions = JSON.parse(repo.readFile('versions.json'))
      expect(versions.new).toEqual('3.2.1')
      expect(repo.readPkg('src/new').version).toEqual('0.0.0-stub')
    })
  })

  describe('upconf', () => {
    it('should migrate versioning from file-based to unified-one', async () => {
      const repoPath = writeRepo({ name: 'upconf-file-tag', spec: 'src/a@0.0.0-stub,src/b@0.0.0-stub,src/c@0.0.0-stub' })
      const repo = await initRepo(repoPath, {
        versioning: {
          source: 'file',
          unified_versions_for: [['c']],
        },
        update: {
          autolint: true,
        },
      })

      const versions = {
        a: '0.45.0',
        b: '0.45.0',
        c: '1.3.0',
      }
      await repo.writeFile('versions.json', JSON.stringify(versions, null, 2), 'write versions')
      await repo.tag('release-initial')

      await repo.updateConfig({
        versioning: {
          source: 'tag',
          unified: true,
        },
      })
      await repo.runScript('pvm upconf prepare')

      await repo.commitAll('migration')

      await repo.runScript('pvm update')
      await repo.syncConfig()
      const lastReleaseTag = repo.lastReleaseTag()
      expect(lastReleaseTag).toEqual(expect.stringMatching(/^v0\.45\.0.*/))
      expect(repo.getTagAnnotation(lastReleaseTag)).toEqual(expect.stringMatching(/.*\n---\nc@1.3.0\s*$/))
    })

    it('ignore independent_packages', async () => {
      const repoPath = writeRepo({
        name: 'upconf-indep-v',
        spec: [
          'src/a@0.0.0-stub',
          'src/b@0.0.0-stub',
          'src/c@0.0.0-stub',
          'tools/too@0.0.0-stub',
          'lib/bar@0.0.0-stub',
          'lib/baz@0.0.0-stub',
        ],
      })
      const repo = await initRepo(repoPath, {
        versioning: {
          source: 'file',
          unified_versions_for: [['a', 'b', 'c'], ['/tools/*']],
        },
        update: {
          autolint: true,
        },
      })

      const versions = {
        a: '0.45.0',
        b: '0.45.0',
        c: '0.45.0',
        bar: '0.8.15',
        baz: '0.3.47',
        too: '0.66.12',
      }
      await repo.writeFile('versions.json', JSON.stringify(versions, null, 2), 'write versions')
      await repo.tag('release-initial')

      await repo.updateConfig({
        versioning: {
          source: 'tag',
          unified: true,
          unified_versions_for: [['/tools/*']],
          independent_packages: ['/lib/*'],
        },
      })
      await repo.runScript('pvm upconf prepare')

      await repo.commitAll('migration')

      await repo.runScript('pvm update')
      await repo.syncConfig()
      const lastReleaseTag = repo.lastReleaseTag()
      expect(lastReleaseTag).toEqual(expect.stringMatching(/^v0\.45\.0.*/))
      expect(repo.getTagAnnotation(lastReleaseTag)).toEqual(expect.stringMatching(/.*\n---\ntoo@0.66.12\nbar@0.8.15\nbaz@0.3.47\s*$/))
    })

    it('drop one unified_grop to MUG', async () => {
      const repoPath = writeRepo({ name: 'upconf-file-tag', spec: 'src/a@0.0.0-stub,src/b@0.0.0-stub,src/c@0.0.0-stub' })
      const repo = await initRepo(repoPath, {
        versioning: {
          source: 'file',
          unified_versions_for: [['a', 'b'], ['c']],
        },
        update: {
          autolint: true,
        },
      })

      const versions = {
        a: '0.45.0',
        b: '0.45.0',
        c: '1.3.0',
      }
      await repo.writeFile('versions.json', JSON.stringify(versions, null, 2), 'write versions')
      await repo.tag('release-initial')

      await repo.updateConfig({
        versioning: {
          source: 'tag',
          unified: true,
          unified_versions_for: [['c']],
        },
      })
      await repo.runScript('pvm upconf prepare')

      await repo.commitAll('migration')

      await repo.runScript('pvm update')
      await repo.syncConfig()
      const lastReleaseTag = repo.lastReleaseTag()
      expect(lastReleaseTag).toEqual(expect.stringMatching(/^v0\.45\.0.*/))
      expect(repo.getTagAnnotation(lastReleaseTag)).toEqual(expect.stringMatching(/.*\n---\nc@1.3.0\s*$/))
    })

    it('should migrate versioning from file-based to unified-one, with some changes', async () => {
      const repoPath = writeRepo({ name: 'upconf-filem-tag', spec: 'src/a@0.0.0-stub,src/b@0.0.0-stub,src/c@0.0.0-stub' })
      const repo = await initRepo(repoPath, {
        versioning: {
          source: 'file',
          unified_versions_for: [['c']],
        },
        update: {
          autolint: true,
        },
      })

      const versions = {
        a: '0.45.0',
        b: '0.45.0',
        c: '1.3.0',
      }
      await repo.writeFile('versions.json', JSON.stringify(versions, null, 2), 'write versions')
      await repo.tag('release-initial')

      await repo.touch('src/a/nf', 'touch a')

      await repo.updateConfig({
        versioning: {
          source: 'tag',
          unified: true,
        },
      })
      await repo.runScript('pvm upconf prepare')

      await repo.commitAll('migration')

      await repo.runScript('pvm update')
      await repo.syncConfig()
      const lastReleaseTag = repo.lastReleaseTag()
      expect(lastReleaseTag).toEqual(expect.stringMatching(/^v0\.46\.0.*/))
      expect(repo.getTagAnnotation(lastReleaseTag)).toEqual(expect.stringMatching(/.*\n---\nc@1.3.0\s*$/))
    })
  })

  describe('packages rename when unified grouping enabled', () => {
    async function commonChangePreparation(repo) {
      await repo.writeFile('src/a/package.json', JSON.stringify({
        'name': '@namespace/a',
        'version': '0.0.0-stub',
      }), 'change 1')

      await repo.writeFile('src/b/package.json', JSON.stringify({
        'name': '@namespace/b',
        'version': '0.0.0-stub',
        'dependencies': {
          '@namespace/a': '0.0.0-stub',
        },
      }), 'change 2')

      await repo.writeFile('src/c/package.json', JSON.stringify({
        'name': '@namespace/c-new',
        'version': '0.0.0-stub',
        'dependencies': {
          '@namespace/a': '0.0.0-stub',
        },
      }), 'change 3')
    }

    it('when only unified versioning enabled', async () => {
      const repo = await initRepo('monorepo-new', {
        changelog: {
          enabled: false,
        },
        versioning: {
          unified_versions_for: [
            '@namespace/a',
            '@namespace/b',
            '@namespace/c',
          ],
          source: 'tag',
        },
        update: {
          autolint: false,
        },
      })

      await repo.tag('release-v0.0.1', `release
---
a@0.1.1
b@0.1.1
c@0.1.1
`)

      await commonChangePreparation(repo)

      const { newVersions, wantedReleaseTypes, repo: innerRepo, updateReasonMap } = await repo.getUpdateState()
      const pkgA = innerRepo.pkgset.get('@namespace/a')
      const pkgB = innerRepo.pkgset.get('@namespace/b')
      expect(newVersions.get(pkgA)).toBe('0.0.1')
      expect(newVersions.get(pkgB)).toBe('0.0.1')
      expect(wantedReleaseTypes.has(pkgA)).toBeTruthy()
      expect(wantedReleaseTypes.has(pkgA)).toBeTruthy()
      expect(updateReasonMap.get(pkgA)).toBe(UpdateReasonType.new)
      expect(updateReasonMap.get(pkgB)).toBe(UpdateReasonType.new)
    })

    it('when unified versioning enabled and per package tagging enabled', async () => {
      const repo = await initRepo('monorepo-new', {
        changelog: {
          enabled: false,
        },
        tagging: {
          for_packages: {
            enabled: true,
            as_release: true,
          },
        },
        versioning: {
          unified_versions_for: [
            '@namespace/a',
            '@namespace/b',
            '@namespace/c',
          ],
          source: 'tag',
        },
        update: {
          autolint: false,
        },
      })

      await repo.tag('release-v0.0.1', `release
---
a@0.1.1
b@0.1.1
c@0.1.1
`)
      await repo.tag('a-v0.1.1')
      await repo.tag('b-v0.1.1')
      await repo.tag('c-v0.1.1')

      await commonChangePreparation(repo)

      const { newVersions, wantedReleaseTypes, repo: innerRepo, updateReasonMap } = await repo.getUpdateState()
      const pkgA = innerRepo.pkgset.get('@namespace/a')
      const pkgB = innerRepo.pkgset.get('@namespace/b')
      expect(newVersions.get(pkgA)).toBe('0.1.1')
      expect(newVersions.get(pkgB)).toBe('0.1.1')
      expect(wantedReleaseTypes.has(pkgA)).toBeTruthy()
      expect(wantedReleaseTypes.has(pkgA)).toBeTruthy()
      expect(updateReasonMap.get(pkgA)).toBe(UpdateReasonType.new)
      expect(updateReasonMap.get(pkgB)).toBe(UpdateReasonType.new)
    })
  })

  describe('update hints in merge request', () => {
    afterEach(() => {
      process.env.CI_PROJECT_ID = 111
    })

    it('update hints should be used', async () => {
      const repo = await initRepo('simple-one')

      await repo.writeFile('trigger.txt', 'trigger', 'fix: change')

      const lastCommit = revParse('HEAD', repo.cwd)
      await got(`${process.env.PVM_CONFIG_GITLAB__URL}/api/v4/merge-request-for-commit/${lastCommit}`, {
        method: 'POST',
        json: {
          state: 'merged',
          description: `
\`\`\`toml
kind = 'pvm-update-hints'
[release-types]
major = '*'
\`\`\`
        `,
        },
      })

      process.env.CI_PROJECT_ID = 'WITHOUT_MR'
      const { newVersions, repo: innerRepo } = await repo.getUpdateState()

      const pkg = innerRepo.pkgset.get('simple-one')
      expect(newVersions.get(pkg)).toBe('1.0.0')
    })
  })
})
