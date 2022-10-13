import gitLog from 'git-log-parser' // @TODO рассмотреть git-raw-commits, возможно он будет пошустрее
import through from 'through2'
import { error } from '../logger'

import type { Commit } from '@pvm/types'
import type { SpawnOptions } from 'child_process'

// format: https://github.com/bendrucker/git-log-parser#logparseconfig-options---streamcommits
function log(opts: Record<string, any>, spawnOpts: SpawnOptions | undefined = void 0): Promise<Commit[]> {
  return new Promise((resolve, reject) => {
    const commits: Commit[] = []

    gitLog.parse(opts, spawnOpts)
      .on('error', reject)
      .pipe(through.obj((commit, _enc, cb) => {
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
      error(e)
      process.exitCode = 1
    })
}

export default log
