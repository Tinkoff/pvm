describe('pvm-upconf', () => {
  it('should migrate versioning from file-based to unified-one', async () => {
    const repoPath = writeRepo({ name: 'upconf-file-tag', spec: 'src/a@0.0.0-stub,src/b@0.0.0-stub,src/c@0.0.0-stub' })
    const repo = await initRepo(repoPath, {
      versioning: {
        source: 'file',
        unified_versions_for: [['c']],
      },
      update: {
        autolint: true,
      },
    })

    const versions = {
      a: '0.45.0',
      b: '0.45.0',
      c: '1.3.0',
    }
    await repo.writeFile('versions.json', JSON.stringify(versions, null, 2), 'write versions')
    await repo.tag('release-initial')

    await repo.updateConfig({
      versioning: {
        source: 'tag',
        unified: true,
      },
    })
    await repo.runScript('pvm upconf prepare')

    await repo.commitAll('migration')

    await repo.runScript('pvm upconf migrate')
    await repo.syncConfig()
    const lastReleaseTag = repo.lastReleaseTag()
    expect(lastReleaseTag).toEqual(expect.stringMatching(/^v0\.45\.0.*/))
    expect(repo.getTagAnnotation(lastReleaseTag)).toEqual(expect.stringMatching(/.*\n---\nc@1.3.0\s*$/))
  })
})
