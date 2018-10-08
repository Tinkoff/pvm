
describe('pvm-slack', () => {
  it('отправка сообщения из json файла', async () => {
    const repo = await initRepo('slack-ctx')

    await runScript(repo, 'pvm slack send -m msg.json')
  })
})
