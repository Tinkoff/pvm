import fs from 'fs'
import path from 'path'
import initRepo from '../initRepo'
import { writeRepo } from '../writeRepo'

describe('pvm/changelog', () => {
  it('[nomono] should not generate empty section if there are no commits since release', async () => {
    const repo = await initRepo('simple-one', {
      versioning: {
        source: 'tag',
      },
      release_list: {
        enabled: true,
      },
    })

    await repo.touch('a', 'Eugene Onegin')
    await repo.tag('v1.0.0', 'Eugene Onegin')
    await repo.touch('b', 'Dubrovsky')
    await repo.tag('v1.1.0', 'Dubrovsky')
    await repo.touch('c', 'The Captain’s Daughter')
    await repo.tag('v2.0.0', 'The Captain’s Daughter')

    await repo.runScript('pvm releases make')
    await repo.runScript('pvm changelog make')

    expect(repo.shell('cat changelog.md')).toMatchSnapshot()
  })

  it('[mono] in default config should use package version for package changelogs', async () => {
    const repo = await initRepo('monorepo-new', {
      changelog: {
        for_packages: {
          enabled: true,
          output_dir: 'changelogs',
        },
      },
    })

    await repo.touch('src/a/foo', 'change a')
    await repo.runScript('pvm update')
    await repo.touch('src/a/bar', 'change a again')
    await repo.runScript('pvm update')

    expect(repo.shell('cat changelogs/a.md')).toMatchSnapshot()
  }, 50000)

  it('should generate main changelog as well', async () => {
    const repo = await initRepo('monorepo-new', {
      versioning: {
        unified_versions_for: ['*'],
      },
    })
    await repo.touch('src/a/foo', 'change a')
    await repo.runScript('pvm update')

    const changelogA = repo.shell('cat changelog.md')
    await repo.touch('src/b/foo', 'change b')
    await repo.runScript('pvm update')
    const changelogB = repo.shell('cat changelog.md')

    expect(changelogA).not.toEqual(changelogB)
  })

  it('should generate front-matter for new pacakges', async () => {
    const repo = await initRepo('monouno', {
      changelog: {
        for_packages: {
          enabled: true,
          output_dir: 'changelogs',
          front_matter: `id: pkg-{{pkg.shortName}}\ntitle: '{{pkg.name}}'`,
        },
      },
    })

    await repo.addPkg('src/new-pkg', {
      name: 'new-pkg',
      version: '1.0.0',
    })
    await repo.commitAll('added new-pkg')
    await repo.touch('src/new-pkg/foo', 'change new-pkg')
    await repo.runScript('pvm update')

    const newPkgMd = repo.readFile('changelogs/new-pkg.md')

    expect(newPkgMd).toEqual(expect.stringMatching(/^---/))
  })

  it('should able to store changelogs in specific branch', async () => {
    const repoPath = writeRepo({
      name: 'changelog-branch',
      spec: [
        'src/a@1.0.0',
        'src/b@2.0.0',
        'src/c@3.0.0',
      ],
    })
    const repo = await initRepo(repoPath, {
      update: {
        autolint: true,
      },
      changelog: {
        storage: {
          type: 'branch',
          branch: 'changelogs',
        },
      },
    })

    await repo.addPkg('src/new-pkg', {
      name: 'new-pkg',
      version: '1.0.0',
    })
    await repo.commitAll('added new-pkg')
    await repo.touch('src/new-pkg/foo', 'change new-pkg')
    await repo.runScript('pvm update')
    await repo.touch('src/new-pkg/bar', 'change new-pkg again')
    await repo.runScript('pvm update')
    await repo.runScript('pvm changelog make')
    expect(fs.existsSync(path.join(repo.cwd, 'changelog.md'))).toBe(true)
    expect(fs.lstatSync(path.join(repo.cwd, 'changelog.md')).size).not.toEqual(0)
  }, 50000)

  it('should able to regenerate changelog from scratch', async () => {
    const repo = await initRepo('monorepo-new', {
      release_list: {
        enabled: true,
      },
    })
    await repo.touch(['src/a/nf', 'src/b/nf'], 'change a and b')
    await repo.runScript('pvm update')
    await repo.touch(['src/b/nf-2', 'src/c/nf'], 'change b and c')
    await repo.runScript('pvm update')

    await repo.runScript('git rm changelog.md')
    await repo.touch('src/a/nv')
    await repo.commitAll('remove changelog, change a')

    await repo.runScript('pvm releases make')
    await repo.runScript('pvm changelog make')

    expect(repo.shell('cat changelog.md')).toMatchSnapshot()
  })

  it('should include upcoming release in case append-upcoming-release option', async () => {
    const repo = await initRepo('monorepo-new', {
      release_list: {
        enabled: true,
      },
    })
    await repo.touch(['src/a/nf', 'src/b/nf'], 'change a and b')
    await repo.runScript('pvm releases make --append-upcoming-release')
    await repo.runScript('pvm changelog make --append-upcoming-release')
    expect(repo.existsPath('releaseList.json')).toBe(true)

    const releasesList = JSON.parse(repo.readFile('releaseList.json'))
    expect(releasesList).toHaveLength(1)
  })
})
