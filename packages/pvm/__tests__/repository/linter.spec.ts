import fs from 'fs'
import path from 'path'
import { lint } from '../../mechanics/repository/linter'
import { Repository } from '../../mechanics/repository/repository'
import { versioningFile } from '../../lib/dedicated-versions-file'

async function getRepository(testRepo: any): Promise<Repository> {
  return await Repository.init(testRepo.dir)
}

const fallbackVersion = '0.0.1'

describe('linter', () => {
  describe('dedicated versions in file', () => {
    it('in case no version should add real version to versions file and stub version to package', async () => {
      // @ts-ignore
      const repo = await initRepo('monostub')

      await repo.writeFile('src/new/package.json', JSON.stringify({
        name: 'new',
      }, null, 2), 'add new package')

      const lintResult = lint(await getRepository(repo), {
        fix: true,
        index: true,
      })

      expect(lintResult.errors).toHaveLength(0)
      expect(repo.readPkg('src/new').version).toEqual('0.0.0-stub')

      const versionsFile = JSON.parse(repo.readFile('versions.json'))
      expect(versionsFile).toHaveProperty('new', fallbackVersion)
    })

    it('should move real version of new package to versions file', async () => {
      // @ts-ignore
      const repo = await initRepo('monostub')

      await repo.addPkg('src/new', {
        name: 'new',
        version: '3.2.1',
      })

      await repo.commitAll('added new pkg')

      const lintResult = lint(await getRepository(repo), {
        fix: true,
        index: true,
      })

      expect(lintResult.errors).toHaveLength(0)

      expect(repo.readPkg('src/new').version).toEqual('0.0.0-stub')

      const versionsFile = JSON.parse(repo.readFile('versions.json'))
      expect(versionsFile).toHaveProperty('new', '3.2.1')
    })

    it('should create versions file if not exists', async () => {
      // @ts-ignore
      const repo = await initRepo('monorepo-new', {
        versioning: {
          source: 'file',
        },
      })

      const lintResult = lint(await getRepository(repo), {
        fix: true,
        index: true,
      })

      expect(lintResult.errors).toHaveLength(0)

      expect(fs.existsSync(path.resolve(repo.dir, 'versions.json'))).toBe(true)
      const versionsFile = JSON.parse(repo.readFile('versions.json'))

      expect(versionsFile).toEqual({
        a: '1.0.0',
        b: '2.0.0',
        c: '1.0.0-beta.1',
      })
    })

    it('should remove unnecessary package entries from versions.json file', async () => {
      // @ts-ignore
      const repo = await initRepo('monostub')

      await repo.runScript('git rm -rf src/b')
      await repo.runScript('git rm -rf src/a')

      const lintResult = lint(await getRepository(repo), {
        fix: true,
        index: true,
      })

      expect(lintResult.errors).toHaveLength(0)

      const versionsFile = JSON.parse(repo.readFile('versions.json'))

      expect(versionsFile).toEqual({
        c: '1.1.0',
      })
    })

    it('in case of existing stub version, should write non-stub version to versions file', async () => {
      // @ts-ignore
      const repo = await initRepo('monostub')

      await repo.addPkg('src/new', {
        name: 'new',
        version: '0.0.0-stub',
      })

      await repo.commitAll('added new pkg with stub version')

      const lintResult = lint(await getRepository(repo), {
        fix: true,
        index: true,
      })

      expect(lintResult.errors).toHaveLength(0)

      expect(repo.readPkg('src/new').version).toEqual('0.0.0-stub')

      const versionsFile = JSON.parse(repo.readFile('versions.json'))
      expect(versionsFile).toHaveProperty('new', fallbackVersion)
    })

    it('should rewrite stub versions in versioning file', async () => {
      // @ts-ignore
      const repo = await initRepo('monostub')
      const pvmRepo = await getRepository(repo)

      const versions = versioningFile.load(pvmRepo.config) as Record<string, string>
      versions['a'] = '0.0.0-stub'
      versioningFile.save(pvmRepo.config, versions, true)

      const lintResult = lint(pvmRepo, {
        fix: true,
        index: true,
      })

      expect(lintResult.errors).toHaveLength(0)
      expect(repo.readPkg('src/a').version).toEqual('0.0.0-stub')
      const versionsFile = JSON.parse(repo.readFile('versions.json'))
      expect(versionsFile).toHaveProperty('a', fallbackVersion)
    })
  })

  describe('dedicated unified version in single tag', () => {
    it('should rewrite package versions to stubs', async () => {
      // @ts-ignore
      const repo = await initRepo('monouno', {
        versioning: {
          source: 'tag',
        },
      })

      const lintResult = lint(await getRepository(repo), {
        fix: true,
        index: true,
      })

      expect(lintResult.errors).toHaveLength(0)

      expect(repo.readPkg('src/a').version).toEqual('0.0.0-stub')
      expect(repo.readPkg('src/b').version).toEqual('0.0.0-stub')
      expect(repo.readPkg('src/c').version).toEqual('0.0.0-stub')
    })
  })
})
