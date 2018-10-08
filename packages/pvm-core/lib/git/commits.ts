import log from './log'
import { logger } from '../logger'
import type { Commit } from '../../types/git-log'

interface CommitsOptions {
  _?: string[],
}

function commits(cwd: string, rev1: string | undefined, rev2: string, opts: CommitsOptions = {}): Promise<Commit[]> {
  const { _ = [], ...rest } = opts

  return log({
    _: [rev1 ? `${rev1}..${rev2}` : rev2].concat(_),
    'no-merges': true,
    ...rest,
  }, {
    cwd,
  })
}

if (require.main === module) {
  // @ts-ignore
  commits(process.cwd(), ...process.argv.slice(2))
    .then(commits => {
      console.log(commits)
    })
    .catch(e => {
      logger.fatal(e)
      process.exitCode = 1
    })
}

export default commits
