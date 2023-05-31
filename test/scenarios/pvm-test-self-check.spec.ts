import initRepo from '../initRepo'

describe('pvm-test-self-check', () => {
  // Отключен self-check локально т.к. не хочу трогать глобально настроенного пользователя
  if (process.env.CI) {
    it('runScript should run pvm in clean environment', async () => {
      const repo = await initRepo('empty')

      await expect(repo.runScript('pvm _eval git config user.name')).rejects.toBeDefined()
      await expect(repo.runScript('pvm _eval git config user.email')).rejects.toBeDefined()
    })

    it('execScript should run pvm in clean environment', async () => {
      const repo = await initRepo('empty')

      await expect(repo.execScript('pvm _eval git config user.name')).rejects.toBeDefined()
      await expect(repo.execScript('pvm _eval git config user.email')).rejects.toBeDefined()
    })
  }
})
