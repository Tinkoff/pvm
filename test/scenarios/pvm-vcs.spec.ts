import initRepo from '../initRepo'
import { runScript } from '../executors'

describe('pvm/vcs', () => {
  it('pvm-vcs is-branch-actual should exit with code 0 if branch is actual', async () => {
    const repo = await initRepo('mono-empty')
    await runScript(repo, `git checkout -b test`)
    await runScript(repo, `touch nf && git add nf`)
    await runScript(repo, `git commit  -am "added new file"`)
    await runScript(repo, `git fetch origin`)

    await runScript(repo, `pvm vcs is-branch-actual`)
  })
})
