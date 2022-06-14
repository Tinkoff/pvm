describe('pvm-provider', () => {
  it('should load configDefaults from pvm-provider', async () => {
    const repo = await initRepo('pvm-provider')
    await repo.runScript('npm install')
    await repo.syncConfig()
    expect(repo.config.changelog.path).toEqual('changelog-provider-test.md')
  })

  it('should load plugins from pvm-provider deps', async () => {
    const repo = await initRepo('pvm-provider')
    await repo.runScript('npm install')
    await repo.syncConfig()
    const hostApi = await repo.getHostApi()
    expect(hostApi.run('test.fn')).toEqual('test.fn')
  })
})
