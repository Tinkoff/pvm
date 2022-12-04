import initRepo from '../initRepo'

describe('pvm/local-plugins', () => {
  it('should load local plugins', async () => {
    const repo = await initRepo('local-plugins', {
      plugins: {
        local_plugins: [
          'pvm-local/local.js',
        ],
      },
    })

    const { stdout } = await repo.execScript('pvm update')
    expect(stdout).toMatch(/local plugin loaded sucessfully/)
  })
})
