// @ts-ignore
import gitLog from 'git-log-parser' // @TODO рассмотреть git-raw-commits, возможно он будет пошустрее
// @ts-ignore
import through from 'through2'
import { logger } from '../logger'

import type { Commit } from '../../types'
import type { SpawnOptions } from 'child_process'

// format: https://github.com/bendrucker/git-log-parser#logparseconfig-options---streamcommits
function log(opts: Record<string, any>, spawnOpts: SpawnOptions | undefined = void 0): Promise<Commit[]> {
  return new Promise((resolve, reject) => {
    const commits: Commit[] = []

    gitLog.parse(opts, spawnOpts)
      .on('error', reject)
      .pipe(through.obj((commit: Commit, _enc: unknown, cb: (p: any) => void) => {
        commits.push(commit)
        cb(null)
      }).on('finish', () => {
        resolve(commits)
      }).on('error', reject))
  })
}

if (require.main === module) {
  const params = JSON.parse(process.argv[2])
  log(params)
    .then(commits => {
      console.log(commits)
    })
    .catch(e => {
      logger.error(e)
      process.exitCode = 1
    })
}

export default log
