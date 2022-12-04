import initRepo from '../initRepo'
import { writeRepo } from '../writeRepo'

const { loadPkg } = require('../../packages/pvm/lib/pkg')
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
      spec: 'src/configCwd@1.0.0',
    }))

    await repo.writeFile('src/configCwd/.pvm.toml', `[test]
test = 'test'`)

    const { stdout } = await repo.execScript('pvm show config', {
      cwd: path.resolve(repo.cwd, 'src', 'configCwd'),
    })

    expect(stdout).toMatch('[test]')
  })

  it('update-hints.toml should load from cwd, not git root', async () => {
    const repoPath = writeRepo({
      name: 'config-load',
      spec: 'src/configCwd@1.0.0',
    })
    const repo = await initRepo(repoPath, {}, {
      cwd: path.join(repoPath, 'src', 'configCwd'),
    })

    await repo.writeFile('update-hints.toml', `release-type = 'major'`, 'hints')

    const updateState = await repo.getUpdateState()

    expect(updateState.updateContext.hints).toMatchObject({
      'release-type': 'major',
    })
  })

  it('updated packages are returned when cwd differs from root', async () => {
    const repo = await initRepo('nested-project', {}, {
      cwd: 'project-root',
    })

    await repo.writeFile('workspace-pkg/index.js', `// change`, 'update trigger')

    const updateState = await repo.getUpdateState()

    const upPkg = updateState.updateReasonMap.keys().next().value
    expect(upPkg.name).toBe('workspace-pkg')
    expect(updateState.updateReasonMap.get(upPkg)).toBe('by_commits')
  })
})
