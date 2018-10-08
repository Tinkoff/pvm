
describe('releases', () => {
  it('should generate ReleaseList artifact from scratch', async () => {
    const repo = await initRepo('monorepo-new', {
      versioning: {
        source: 'tag',
        unified: true,
      },
      release_list: {
        enabled: true,
      },
    })
    await repo.annotatedTag('v1.0.0', 'Initial release')

    await repo.touch('src/a/nf', 'change a')
    await repo.annotatedTag('v1.1.0', 'Second release')

    await repo.runScript('pvm releases make')
    expect(repo.existsPath('releaseList.json')).toBe(true)

    const releaseList = JSON.parse(repo.readFile('releaseList.json'))

    expect(releaseList).toHaveLength(2)
  })

  it('should able to upload & download ReleaseList artifact from branch storage', async () => {
    const repo = await initRepo('monorepo-new', {
      versioning: {
        source: 'tag',
        unified: true,
      },
      release_list: {
        enabled: true,
        storage: {
          type: 'branch',
          branch: 'artifacts',
        },
      },
    })
    await repo.annotatedTag('v1.0.0', 'Initial release')

    await repo.touch('src/a/nf', 'change a')
    await repo.annotatedTag('v1.1.0', 'Second release')

    await repo.runScript('pvm releases make')
    expect(repo.existsPath('releaseList.json')).toBe(true)

    await repo.runScript('pvm releases upload')
    await repo.runScript('git clean -f')
    expect(repo.existsPath('releaseList.json')).toBe(false)

    await repo.runScript('pvm releases download')
    expect(repo.existsPath('releaseList.json')).toBe(true)
  })
})
