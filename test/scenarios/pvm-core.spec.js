const { loadPkg } = require('../../packages/pvm-core/lib/pkg')
const path = require('path')

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

  it('config loader should load config from cwd folder', async () => {
    const repo = await initRepo(writeRepo({
      name: 'config-load',
      spec: 'configCwd@1.0.0',
    }))

    await repo.writeFile('configCwd/.pvm.toml', `[test]
test = 'test'`)

    const { stdout } = await repo.execScript('pvm show config', {
      cwd: path.resolve(repo.cwd, 'configCwd'),
    })

    expect(stdout).toMatch('[test]')
  })
})
