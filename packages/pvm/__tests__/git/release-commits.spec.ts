import { getReleaseCommits, releaseCommitsAsString } from '../../lib/git/release-commits'
import initRepo from '../../../../test/initRepo'

describe('core/release-commits', () => {
  describe('getReleaseCommits', () => {
    it('should exclude release commits', async () => {
      const repo = await initRepo('monorepo-new')
      await repo.tag('release-initial')
      repo.touch('src/a/nf', 'change a')
      await repo.runScript('pvm update')

      const commits = await getReleaseCommits(repo.config)
      expect(commits).toBeDefined()
      const commitsSubjects = commits!.map(c => c.subject)
      expect(commitsSubjects).toHaveLength(1)
      expect(commitsSubjects[0]).not.toEqual(expect.stringMatching(/^Release/))
    })
  })

  describe('releaseCommitsAsString', () => {
    it('should exclude release commits', async () => {
      const repo = await initRepo('monorepo-new')
      repo.touch('src/a/nf', 'change a')
      await repo.runScript('pvm update')

      const commitsStr = releaseCommitsAsString(repo.config)
      expect(commitsStr).toBeDefined()
      expect(commitsStr).not.toHaveLength(0)
      expect(commitsStr).not.toEqual(expect.stringContaining('Release'))
    })
  })
})
