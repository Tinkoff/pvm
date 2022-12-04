import semver from 'semver'
import drainItems from '../../lib/iter/drain-items'
import released from '../../mechanics/pkgset/strategies/released'
import all from '../../mechanics/pkgset/strategies/all'
import initRepo from '../../../../test/initRepo'

describe('pkgset/released', () => {
  it('should correctly work for file-based internally-cached versioning', async () => {
    const repo = await initRepo('monostub')

    await repo.tag('release-initial')
    const versions = JSON.parse(repo.readFile('versions.json')) as Record<string, string>
    const currentPackages = await drainItems(all(repo.di, { cwd: repo.dir })) // важная строчка, ей забиваем кеш изначально чтобы позже проверить на корректную инвалидацию
    expect(currentPackages).toHaveLength(3)

    const newVersions = Object.fromEntries(Object.entries(versions).map(([pkg, version]) => [pkg, semver.inc(version, 'minor')]))
    await repo.writeFile('versions.json', JSON.stringify(newVersions), 'release new versions')
    await repo.tag('release-second')

    const newPackages = await drainItems(released(repo.di, { cwd: repo.dir }))

    expect(newPackages).toHaveLength(3)
  })
})
