
import { getPackages } from '../packages'

describe('pvm/getPackages', () => {
  it('dangerously_opts.always_changed_workspaces should work for changed list', async () => {
    // @ts-ignore
    const repo = await initRepo('monorepo-new', {
      dangerously_opts: {
        always_changed_workspaces: [
          'src/[a-b]',
        ],
      },
    })

    const packages = await getPackages('changed', { cwd: repo.dir })

    expect(packages.map(pkg => pkg.path).sort()).toEqual([
      'src/a',
      'src/b',
    ])
  })

  it('dangerously_opts.always_changed_workspaces should work for affected list', async () => {
    // @ts-ignore
    const repo = await initRepo('monorepo-new', {
      dangerously_opts: {
        always_changed_workspaces: [
          'src/a',
        ],
      },
    })

    const packages = await getPackages('affected', { cwd: repo.dir })

    expect(packages.map(pkg => pkg.path).sort()).toEqual([
      'src/a',
      'src/b',
    ])
  })

  it('dangerously_opts.always_changed_workspaces should work for update list', async () => {
    // @ts-ignore
    const repo = await initRepo('monorepo-new', {
      dangerously_opts: {
        always_changed_workspaces: [
          'src/a',
        ],
      },
    })

    const packages = await getPackages('update', { cwd: repo.dir })

    expect(packages.map(pkg => pkg.path).sort()).toEqual([
      'src/a',
      'src/b',
    ])
  })
})
