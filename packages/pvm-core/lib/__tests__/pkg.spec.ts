
describe('pkg', () => {
  it('should take version from semver tag itself in case unified_versions_for covers all repo', async () => {
    // @ts-ignore
    const repoPath = writeRepo({ name: 'indep', spec: 'src/a@1.0.0,src/b@1.0.0' })
    // @ts-ignore
    const repo = await initRepo(repoPath, {
      versioning: {
        unified: false,
        source: 'tag',
        unified_versions_for: ['*'],
      },
      update: {
        autolint: false,
      },
    })

    await repo.tag('v2.0.0')
    expect((await repo.loadPkg('src/a')).version).toEqual('2.0.0')
  })

  it('source=tag, package from second groups should not take versions from semver tag', async () => {
    // @ts-ignore
    const repoPath = writeRepo({ name: 'abc', spec: 'src/a@1.0.0,src/b@1.0.0,src/c@1.0.0' })
    // @ts-ignore
    const repo = await initRepo(repoPath, {
      versioning: {
        unified: true,
        source: 'tag',
        unified_versions_for: [['c', 'b']],
      },
      update: {
        autolint: false,
      },
    })

    await repo.tag('v2.1.4')
    expect((await repo.loadPkg('src/b')).version).not.toEqual('2.1.4')
  })

  it('fallback version should not be from package for source=tag repos', async () => {
    // @ts-ignore
    const repoPath = writeRepo({ name: 'abc', spec: 'src/a@1.0.0,src/b@1.1.2,src/c@1.0.0' })
    // @ts-ignore
    const repo = await initRepo(repoPath, {
      versioning: {
        unified: true,
        source: 'tag',
        unified_versions_for: [['c', 'b']],
      },
      update: {
        autolint: false,
      },
    })

    await repo.tag('v2.1.4')
    expect((await repo.loadPkg('src/b')).version).not.toEqual('1.1.2')
  })

  it(`should take version from last tag's annotations if head tags are simple ones`, async () => {
    // @ts-ignore
    const repoPath = writeRepo({ name: 'abc', spec: 'src/a@1.0.0,src/b@1.0.0,src/c@1.0.0' })
    // @ts-ignore
    const repo = await initRepo(repoPath, {
      versioning: {
        unified: true,
        source: 'tag',
        unified_versions_for: [['c', 'b']],
      },
      update: {
        autolint: false,
      },
    })

    await repo.annotatedTag('v2.0.0', `\n---\nb@1.1.0\nc@1.1.0\n`)
    await repo.touch('src/a/nf', 'change a')
    await repo.tag('v2.1.0')
    await repo.touch('src/a/nf2', 'change a again')
    await repo.tag('v2.1.1')
    expect((await repo.loadPkg('src/b')).version).toEqual('1.1.0')
  })

  it('should take initialVersion as initial from package.json in case dedicated version', async () => {
    // @ts-ignore
    const repo = await initRepo('monorepo-new', {
      versioning: {
        unified: true,
        source: 'tag',
      },
      update: {
        autolint: false,
      },
    })

    await repo.addPkg('src/new', {
      name: 'new',
      version: '0.0.0-stub',
      initialVersion: '1.20.300',
    })

    expect((await repo.loadPkg('src/new')).version).toEqual('1.20.300')
  })
})
