const lastTag = require('../../packages/pvm-core/lib/git/last-tag').default

describe('pvm/add-tag', () => {
  it('должен учитывать конфиг', async () => {
    const repo = await initRepo('fix-commit', {
      update: {
        default_release_type: 'major',
      },
    })
    await runScript(repo, 'pvm add-tag')

    const tagName = lastTag({ cwd: repo.dir })
    expect(tagName).toEqual('v2.0.0')
  })

  it('должен выставлять версию когда релизов еще не было', async () => {
    const repo = await initRepo('simple-one', {
      update: {
        default_release_type: 'major',
      },
    })
    await runScript(repo, 'pvm add-tag')

    const tagName = lastTag({ cwd: repo.dir })
    expect(tagName).toEqual('v1.0.0')
  })

  it('должен учитывать versioning.source = "tag"', async () => {
    const repo = await initRepo('simple-one', {
      versioning: {
        source: 'tag',
      },
      update: {
        default_release_type: 'minor',
      },
    })
    await repo.tag('v4.0.0')
    await repo.writeFile('dummy.txt', 'dummy', 'next change')
    await runScript(repo, 'pvm add-tag')

    const tagName = lastTag({ cwd: repo.dir })
    expect(tagName).toEqual('v4.1.0')
  })
})
