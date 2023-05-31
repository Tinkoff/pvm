import { runScript } from '../executors'
import initRepo from '../initRepo'
import { writeRepo } from '../writeRepo'

describe('pvm/set-versions', () => {
  it('подъем версий по маске', async () => {
    const repo = await initRepo('monorepo-new')

    await runScript(repo, 'pvm set-versions patch -p src/a -p src/b')

    expect(require(repo.dir + '/src/a/package.json').version).toEqual('1.0.1')
    expect(require(repo.dir + '/src/b/package.json').version).toEqual('2.0.1')
    expect(require(repo.dir + '/src/c/package.json').version).toEqual('1.0.0-beta.1')
  })

  it('подъем версий по маске с учетом депендантов', async () => {
    const repo = await initRepo('monorepo-new')

    await runScript(repo, 'pvm set-versions patch -p src/a -u -b')

    expect(require(repo.dir + '/src/a/package.json').version).toEqual('1.0.1')
    expect(require(repo.dir + '/src/b/package.json').version).toEqual('2.0.1')
    expect(require(repo.dir + '/src/c/package.json').version).toEqual('1.0.0-beta.1')
  })

  it('алиас write-versions запускает команду set-versions с правильными параметрами', async () => {
    const repoPath = writeRepo({ name: 'simple-one', spec: 'src/a@0.0.0-stub' })
    const repo = await initRepo(repoPath, {
      versioning: {
        unified: true,
        source: 'tag',
      },
      release: {
        tag_only: true,
      },
    })

    await repo.tag('v2.0.0')
    await runScript(repo, 'pvm write-versions')

    expect(require(repo.dir + '/src/a/package.json').version).toEqual('2.0.0')
  })
})
