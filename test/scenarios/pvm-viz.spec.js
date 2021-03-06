
describe('pvm/viz', () => {
  it('должен рисовать граф для зависимостей с ^', async () => {
    const repo = await initRepo('mono-pre-deps')

    await repo.touch(['src/b/nf', 'src/a/nf'], 'update packages')

    await runScript(repo, 'pvm update -p dot > update-diff.dot')
    await runScript(repo, 'pvm viz update-diff.dot > update-diff.svg')
  })
})
