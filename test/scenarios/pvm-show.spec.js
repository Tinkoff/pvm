describe('pvm-show', () => {
  it.concurrent('pvm show release-commits should work without releases', async () => {
    const repo = await initRepo('monorepo-new')
    const { stdout } = await repo.execScript('pvm show release-commits')
    expect(stdout).toEqual('')
  })

  it.concurrent('pvm show release-commits should show release commits', async () => {
    const repo = await initRepo('monorepo-new')
    await repo.tag('release-one')
    await repo.touch('src/a/nf', 'change a')
    await repo.touch('src/b/nf', 'change b')
    const { stdout } = await repo.execScript('pvm show release-commits')
    expect(stdout).toEqual('change b\nchange a\n')
  })
})
