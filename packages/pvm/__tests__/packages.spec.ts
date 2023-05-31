import initRepo from '../../../test/initRepo'
import { getPackages } from '../mechanics/packages'

describe('pvm/getPackages', () => {
  it('dangerously_opts.always_changed_workspaces should work for changed list', async () => {
    const repo = await initRepo('monorepo-new', {
      dangerously_opts: {
        always_changed_workspaces: [
          'src/[a-b]',
        ],
      },
    })

    const packages = await getPackages(repo.di, 'changed', { cwd: repo.dir })

    expect(packages.map(pkg => pkg.path).sort()).toEqual([
      'src/a',
      'src/b',
    ])
  })

  it('dangerously_opts.always_changed_workspaces should work for affected list', async () => {
    const repo = await initRepo('monorepo-new', {
      dangerously_opts: {
        always_changed_workspaces: [
          'src/a',
        ],
      },
    })

    const packages = await getPackages(repo.di, 'affected', { cwd: repo.dir })

    expect(packages.map(pkg => pkg.path).sort()).toEqual([
      'src/a',
      'src/b',
    ])
  })

  it('dangerously_opts.always_changed_workspaces should work for update list', async () => {
    const repo = await initRepo('monorepo-new', {
      dangerously_opts: {
        always_changed_workspaces: [
          'src/a',
        ],
      },
    })

    const packages = await getPackages(repo.di, 'update', { cwd: repo.dir })

    expect(packages.map(pkg => pkg.path).sort()).toEqual([
      'src/a',
      'src/b',
    ])
  })
})
