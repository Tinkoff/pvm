import initRepo from '../initRepo'

describe('pvm-git-branch-storage', () => {
  it('config and plugins should load from main worktree', async () => {
    const repo = await initRepo('local-plugins', {
      update: {
        include_root: true,
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

    expect(stdout).toMatch(/plugin_v2 loaded successfully/)
  })
})
