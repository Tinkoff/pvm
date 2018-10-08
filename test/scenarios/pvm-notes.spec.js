
describe('pvm/notes', () => {
  it('релизные ноты из одного коммита', async () => {
    const repo = await initRepo('pvm-notes-1')
    await repo.touch('a.txt', 'init a')
    await repo.tag('v1.0.0', 'initial release')

    await repo.writeFile('a.txt', 'hello world', 'update a')
    await repo.tag('v1.1.0')
    await runScript(repo, 'pvm notes')

    expect(repo.tagNotes('v1.1.0')).toEqual('update a')
  })

  it('релизные ноты из двух коммитов', async () => {
    const repo = await initRepo('pvm-notes-2')
    await repo.touch('a.txt', 'init a')
    await repo.tag('v1.0.0', 'initial release')

    await repo.writeFile('a.txt', 'hello world', 'update a')
    await repo.writeFile('a.txt', 'hello world!', 'update a again')
    await repo.tag('v1.1.0')

    await runScript(repo, 'pvm notes')

    expect(repo.tagNotes('v1.1.0')).toEqual('- update a again\n- update a')
  })
})
