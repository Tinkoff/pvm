const { getConfig } = require('@pvm/core/lib/config')
const { GitBranchStorage } = require('@pvm/artifacts/lib/backend/git-branch-storage')

describe('pvm-git-branch-storage', () => {
  it('config and plugins should load from main worktree', async () => {
    const repo = await initRepo('local-plugins', {
      update: {
        include_root: true,
      },
      plugins: {
        local_plugins: [
          'pvm-local/local.js',
        ],
      },
      plugins_v2: [
        {
          plugin: './pvm-plugin-v2/plugin.js',
        },
      ],
      changelog: {
        enabled: true,
        storage: {
          type: 'branch',
          branch: 'pvm-artifacts',
        },
      },
    })

    await repo.writeFile('change_trigger.txt', 'change', 'change')

    const { stdout } = await repo.execScript('pvm update')

    expect(stdout).toMatch(/local plugin loaded sucessfully. Branch: pvm-artifacts/)
    expect(stdout).toMatch(/plugin_v2 loaded successfully/)
  })

  it('defaults for new worktree cwd should be taken from main worktree config', async () => {
    const repo = await initRepo('pvm-provider')
    const gitBranchStorage = new GitBranchStorage({
      cwd: repo.cwd,
      branch: 'pvm-artifacts',
    })
    await gitBranchStorage.init()
    console.log(gitBranchStorage.workingDir)
    const config = await getConfig(gitBranchStorage.workingDir)

    expect(config.changelog.path).toEqual('changelog-provider-test.md')
  })
})
