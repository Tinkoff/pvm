import { markReleaseType } from '../pkg-release-type'
import { ChangedContext } from '../changed-context'
import type { UpdateContext } from '../update-context'
import { loadPkg } from '@pvm/core/lib/pkg'
import { UpdateState } from '../update-state'
import { Repository } from '@pvm/repository/lib'

async function makeUpdateState(cwd: string, changedContext: ChangedContext, updateContext: UpdateContext): Promise<UpdateState> {
  const repo = await Repository.init(cwd)
  return new UpdateState(repo, changedContext, updateContext)
}

describe('pvm-update/pkg-release-type', () => {
  it('should respect update.release_type_overrides config', async () => {
    // @ts-ignore
    const repo = await initRepo('monorepo-new', {
      update: {
        release_type_overrides: [
          {
            type: 'none',
            files_match: [
              '**/foo.md',
            ],
          },
        ],
      },
    })
    const aPkg = loadPkg(repo.config, 'src/a')!
    const changedContext = new ChangedContext({
      files: ['readme.md', 'src/a/foo.md'],
      fromRef: 'HEAD^1',
      targetRef: 'HEAD',
      targetLoadRef: void 0,
      cwd: repo.cwd,
      includeUncommited: true,
    }, {
      config: repo.config,
      includeRoot: false,
    }, {
      commits: [],
    })
    const updateContext: UpdateContext = {
      hints: {},
      readHintsFile: false,
    }
    const updateState = await makeUpdateState(repo.dir, changedContext, updateContext)
    await markReleaseType(aPkg, updateState)

    expect(updateState.getLikelyReleaseTypeFor(aPkg)).toEqual(null)
  })
})
