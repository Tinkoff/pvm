import { execScript } from '../executors'
import initRepo from '../initRepo'
import { writeRepo } from '../writeRepo'
import type { Config, RecursivePartial } from '@pvm/pvm'

import { pkgset } from '@pvm/pvm/mechanics/pkgset/pkgset'
import drainItems from '../../packages/pvm/lib/iter/drain-items'

describe('pvm/pkgset', () => {
  it('список изменившихся пакетов, плоский workspace', async () => {
    const repo = await initRepo('changes-against-master')

    const { stdout } = await execScript(repo, `pvm pkgset -s changed -f %p`)
    expect(stdout.split('\n').sort().filter(x => !!x)).toEqual([
      'pkgs/magnolia',
      'pkgs/rosetta',
    ])
  })

  it('список изменившихся пакетов, пакеты в workspace/packages', async () => {
    const repo = await initRepo('changes-against-master-2')

    const { stdout } = await execScript(repo, `pvm pkgset -s changed -f %p`)
    expect(stdout.split('\n').sort().filter(x => !!x)).toEqual([
      'pkgs/magnolia',
      'pkgs/rosetta',
    ])
  })

  it('дифф на два пакета с одинаковым префиксом', async () => {
    const repo = await initRepo('mono-pkgset-bug')
    const { stdout } = await execScript(repo, `pvm pkgset -s changed-at -f %p -S ref=${repo.head}`)

    expect(stdout.split('\n').sort().filter(x => !!x)).toEqual([
      'src/glz',
      'src/glz-update',
    ])
  })

  it('пакеты добавившиеся и изменившиеся в процессе релиза', async () => {
    const repo = await initRepo('monorepo-new', {
      update: {
        update_dependants: false,
      },
    })
    await repo.touch('src/a/for_release', 'release for a')

    await repo.tag(`release-2019-04-05-initial`, 'initial release')
    await repo.addPkg('src/x', {
      name: 'x',
      version: '1.0.0',
    })
    await repo.commit('create x package')
    await repo.touch('src/a/nf', 'change a package')
    await repo.runScript('pvm update')

    const { stdout } = await repo.execScript(`pvm pkgset -s changed-since-release -f %n`)
    expect(stdout.split('\n').sort().filter(x => !!x)).toEqual([
      'a',
      'x',
    ])
  })

  it('package version should be taken from git tag, single-package repository', async () => {
    const repo = await initRepo('simple-one', {
      versioning: {
        source: 'tag',
      },
    })

    await repo.tag('v1.4.24')

    const { stdout: version } = await repo.execScript('pvm pkgset -f %v')

    expect(version.trim()).toEqual('1.4.24')
  })

  it('package version should be taken from git tag, mono repository', async () => {
    const repo = await initRepo('monorepo-new', {
      versioning: {
        source: 'tag',
      },
    })

    await repo.tag('a-v1.4.24')
    await repo.tag('b-v214.4.24')
    await repo.tag('c-v31214.1042.24457')

    const { stdout: versionsRaw } = await repo.execScript('pvm pkgset -f %n-%v')
    const versions = versionsRaw.split('\n').sort().filter(x => x.trim())

    expect(versions).toEqual([
      'a-1.4.24',
      'b-214.4.24',
      'c-31214.1042.24457',
    ])
  })

  it('released packages should return all packages if release tag was created in first commit', async () => {
    const repo = await initRepo('monorepo-new')
    await repo.tag('release-custom')

    const { stdout } = await repo.execScript(`pvm pkgset -s released -f %n`)
    expect(stdout.split('\n').sort().filter(x => !!x)).toEqual([
      'a',
      'b',
      'c',
    ])
  })

  describe('strategy/affected', () => {
    async function testAffected(config: RecursivePartial<Config> | Config['pkgset']['affected_files'], touched: string[] = [], output: string[] = []) {
      const repo = await initRepo('mono-pkgset-affected', Array.isArray(config) ? {
        pkgset: {
          affected_files: config,
        },
      } : config)

      for (const t of touched) {
        await repo.touch(t, `Change ${t}`)
      }

      const res = await drainItems(pkgset(repo.di, 'affected', {
        cwd: repo.dir,
        f: '%n',
        includeUncommited: true,
      }))

      expect(res.map(pkg => pkg.name).sort()).toEqual(output)
    }

    it('should handle affected config in addition to regular deps', async () => {
      await testAffected([
        {
          if_changed: ['*/a/ff'],
          then_affected: ['*/c/package.json'],
        },
      ], ['src/a/ff'], [
        'a',
        'b',
        'c',
      ])
    })

    it('should handle * as affected', async () => {
      await testAffected([
        {
          if_changed: ['*/a/ff'],
          then_affected: '*',
        },
      ], ['src/a/ff'], [
        'a',
        'b',
        'c',
        'd',
      ])
    })

    it('should handle multiple affected sections', async () => {
      await testAffected([
        {
          if_changed: ['*/a/ff'],
          then_affected: ['*/c/package.json'],
        },
        {
          if_changed: ['*/a/ff'],
          then_affected: ['*/d/package.json'],
        },
      ], ['src/a/ff'], [
        'a',
        'b',
        'c',
        'd',
      ])
    })

    it('should handle multiple globs in one section', async () => {
      await testAffected([
        {
          if_changed: ['*/a/ff', '*/b/ff'],
          then_affected: ['*/c/package.json', '*/d/package.json'],
        },
      ], ['src/a/ff'], [
        'a',
        'b',
        'c',
        'd',
      ])
    })

    it('should ignore node_modules', async () => {
      await testAffected([
        {
          if_changed: ['*/a/ff'],
          then_affected: ['**/ignored.js'],
        },
      ], ['src/a/ff'], [
        'a',
        'b',
      ])
    })

    it('should handle always_changed_workspaces flag', async () => {
      await testAffected({
        dangerously_opts: {
          always_changed_workspaces: [
            'src/c',
          ],
        },
      }, [], [
        'c',
      ])
    })

    it('should not emit twice package that is always changed and touched at the same time', async () => {
      await testAffected({
        dangerously_opts: {
          always_changed_workspaces: [
            'src/b',
          ],
        },
      }, ['src/b/ff'], [
        'b',
      ])
    })

    it('pkgs versions should be independent if release_tag_package option set', async () => {
      const repo = await initRepo('monorepo-new', {
        versioning: {
          source: 'tag',
        },
        tagging: {
          release_tag_package: 'src/a',
        },
      })

      await repo.annotatedTag('v0.1.0', `statist-web-client release by pvm

---
a@0.1.0
b@0.2.0
c@0.3.0`)

      await repo.writeFile('src/b/some.txt', 'some', 'changes')

      await repo.annotatedTag('v0.1.0#incredible', `statist-web-client release by pvm

---
a@0.1.0
b@0.3.0
c@0.3.0`)

      const { stdout: released } = await repo.execScript('pvm pkgset -s released')

      expect(released.trim()).toEqual('b@0.3.0')
    })
  })

  // Тесты ходят в реальный npm. Если доступность сети/регистри станет проблемой, то перейти на мок на базе verdaccio
  // https://github.com/pnpm/registry-mock
  describe('strategy/stale', () => {
    it('should handle 404 error and return pkg', async () => {
      const repoPath = writeRepo({
        name: 'withMissingPkg',
        private: true,
        spec: 'src/__never-published-pkg__@0.0.1',
      })
      const repo = await initRepo(repoPath)

      const { stdout } = await repo.execScript('pvm pkgset -s stale')

      expect(stdout.trim()).toBe('__never-published-pkg__@0.0.1')
    })

    it('should return nothing if package exists', async () => {
      const repoPath = writeRepo({
        name: 'withStalePkg',
        private: true,
        spec: 'src/lodash@0.0.1',
      })
      const repo = await initRepo(repoPath)

      const { stdout } = await repo.execScript('pvm pkgset -s stale')

      expect(stdout.trim()).toBe('')
    })

    it('should return pkg if local version greater than in registry', async () => {
      const repoPath = writeRepo({
        name: 'withActualPkg',
        private: true,
        spec: 'src/lodash@10000.0.0',
      })
      const repo = await initRepo(repoPath)

      const { stdout } = await repo.execScript('pvm pkgset -s stale')

      expect(stdout.trim()).toMatch('lodash')
    })
  })
})
