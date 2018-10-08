const getFiles = require('../../packages/pvm-files').default
const path = require('path')

describe('pvm/files', () => {
  it('should work for relative', async () => {
    const repo = await initRepo('monorepo-new')

    await repo.writeFile('src/a/for-collect.js', 'Some script', `Change a`)

    const res = await getFiles('src/*/*.js', {
      cwd: repo.dir,
      strategy: 'affected',
      includeUncommited: true,
      absolute: true,
    })

    expect(res.sort()).toEqual([path.join(repo.dir, 'src/a/for-collect.js')])
  })

  it('should work for absolute', async () => {
    const repo = await initRepo('monorepo-new')

    await repo.writeFile('src/a/for-collect.js', 'Some script', `Change a`)

    const res = await getFiles('src/*/*.js', {
      cwd: repo.dir,
      strategy: 'affected',
      includeUncommited: true,
    })

    expect(res.sort()).toEqual(['src/a/for-collect.js'])
  })

  it('should not match file that lives in unchanged pkg and when root included', async () => {
    const repo = await initRepo('monorepo-new')

    await repo.writeFile('src/c/for-collect.js', 'Some script')
    await repo.writeFile('src/root.js', 'Some script', `Change root`)

    const res = await getFiles('src/root.js', {
      cwd: repo.dir,
      strategy: 'affected',
      includeRoot: true,
    })

    expect(res.sort()).toEqual(['src/root.js'])
  })

  it('should correctly filter out files', async () => {
    const repo = await initRepo('monorepo-new')

    await repo.writeFile('src/a/for-collect.js', 'Some script', 'Change a')
    await repo.writeFile('src/c/not-for-collect.js', 'Some script', 'Change c')
    await repo.writeFile('src/b/for-collect.js', 'Some script', 'Change b')
    await repo.writeFile('src/for-collect.js', 'Some script', `Change root`)

    const res = await getFiles('src/**/for-collect.js', {
      cwd: repo.dir,
      strategy: 'affected',
      includeRoot: true,
    })

    expect(res.sort()).toEqual(['src/a/for-collect.js', 'src/b/for-collect.js', 'src/for-collect.js'])
  })

  it('should not take files that match to wildcard, but in unchanged packages', async () => {
    const repo = await initRepo('monorepo-new')

    await repo.writeFile('src/a/for-collect.js', 'Some script', 'Change a')
    await repo.runScript('cat > src/c/for-collect.js', {
      input: 'test',
    })
    await repo.writeFile('src/for-collect.js', 'Some script', `Change root`)

    const res = await getFiles('src/**/for-collect.js', {
      cwd: repo.dir,
      strategy: 'affected',
      includeUncommited: false,
      includeRoot: true,
    })

    expect(res.sort()).toEqual(['src/a/for-collect.js', 'src/for-collect.js'])
  })

  it('cli should work', async () => {
    const repo = await initRepo('monorepo-new')

    await repo.writeFile('src/a/for-collect.js', 'Some script', `Change a`)

    const { stdout } = await execScript(repo, `pvm files --no-absolute -f **/*.js -f **/*.js -s affected -S include-uncommited=true -S from=HEAD~1`)

    expect(stdout.trim()).toEqual('src/a/for-collect.js')
  })
})
