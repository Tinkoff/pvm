import initRepo from '../initRepo'

describe('pvm/rewrite-notes', () => {
  it('should rewrite notes', async () => {
    const repo = await initRepo('monorepo-new')
    await repo.touch('src/a/nf', 'change a')
    await repo.tag('release-one', 'a release')
    await repo.touch('src/b/nf', 'change b')
    await repo.tag('release-two')

    await repo.runScript('pvm rewrite-notes')

    expect(() => repo.tagNotes('release-one')).not.toThrow()
    expect(() => repo.tagNotes('release-two')).not.toThrow()
  })
})
