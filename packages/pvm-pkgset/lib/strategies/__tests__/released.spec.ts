import semver from 'semver'
import drainItems from '@pvm/core/lib/iter/drain-items'
import released from '../released'
import all from '../all'

describe('pkgset/released', () => {
  it('should correctly work for file-based internally-cached versioning', async () => {
    // @ts-ignore
    const repo = await initRepo('monostub')

    await repo.tag('release-initial')
    const versions = JSON.parse(repo.readFile('versions.json')) as Record<string, string>
    const currentPackages = await drainItems(all({ cwd: repo.dir })) // важная строчка, ей забиваем кеш изначально чтобы позже проверить на корректную инвалидацию
    expect(currentPackages).toHaveLength(3)

    const newVersions = Object.fromEntries(Object.entries(versions).map(([pkg, version]) => [pkg, semver.inc(version, 'minor')]))
    await repo.writeFile('versions.json', JSON.stringify(newVersions), 'release new versions')
    await repo.tag('release-second')

    const newPackages = await drainItems(released({ cwd: repo.dir }))

    expect(newPackages).toHaveLength(3)
  })
})
