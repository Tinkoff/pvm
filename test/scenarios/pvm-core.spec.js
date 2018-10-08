const { loadPkg } = require('../../packages/pvm-core/lib/pkg')

describe('pvm-core', () => {
  it('loadPkg: should load package from non-actual working tree', async () => {
    const repo = await initRepo('monorepo-new')

    const ref = repo.shell('git rev-parse HEAD')

    await repo.runScript('git rm -rf src/a')
    await repo.commitAll('remove src/a')

    const aPkg = loadPkg(repo.config, 'src/a', {
      ref,
    })

    expect(aPkg.version).toEqual('1.0.0')
  })
})
