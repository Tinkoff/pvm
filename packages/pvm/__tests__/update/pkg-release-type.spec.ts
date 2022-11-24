import { markReleaseType } from '../../mechanics/update/pkg-release-type'
import { ChangedContext } from '../../mechanics/update/changed-context'
import type { UpdateContext } from '../../mechanics/update/update-context'
import { loadPkg } from '../../lib/pkg'
import { UpdateState } from '../../mechanics/update/update-state'
import { Repository } from '../../mechanics/repository'

async function makeUpdateState(di, changedContext: ChangedContext, updateContext: UpdateContext): Promise<UpdateState> {
  const repo = await Repository.init(di)
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
    const updateState = await makeUpdateState(repo.di, changedContext, updateContext)
    await markReleaseType(aPkg, updateState)

    expect(updateState.getLikelyReleaseTypeFor(aPkg)).toEqual(null)
  })
})
