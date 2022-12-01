import { provide } from '../../lib/di'
import {
  HOST_API_TOKEN,
  ATTRIBUTE_RELEASE_DATA_HOOK_TOKEN,
  COMMITS_TO_NOTES_TOKEN,
  NOTIFY_SCRIPTS_PATH_TOKEN,
  PRE_RELEASE_HOOK_TOKEN,
  RELEASE_TYPE_BY_COMMITS_TOKEN,
  RELEASE_TYPE_TOKEN,
  CONFIG_TOKEN,
  VCS_TOKEN,
  CWD_TOKEN,
  RESOLVE_PUSH_REMOTE_TOKEN,
  GLOBAL_FLAGS_TOKEN,
  VCS_PLATFORM_TOKEN, PLATFORM_TOKEN, VCS_PLATFORM_FACTORY_TOKEN, RAW_VCS_TOKEN,
} from '../../tokens'
import markdownifyCommits from '../../lib/markdownify-commits'
import type { Pkg } from '../../lib/pkg'
import { releaseMark } from '../../lib/consts'
import type { Commit, PvmReleaseType } from '../../types'
import type { ChangedContext } from '../update/changed-context'
import { VcsPlatform } from './vcs'
import type { ReleaseContext } from '../update/types'
import type { UpdateState } from '../update/update-state'
import type { ReleaseData, ReleaseDataExt } from '../releases/types'
import path from 'path'
import { GitVcs } from './git-vcs'
import { DecoratedVcs } from './decorated-vcs'

export default [
  provide({
    provide: COMMITS_TO_NOTES_TOKEN,
    useFactory({ config }) {
      return (commits) => Promise.resolve(markdownifyCommits(commits, { jiraUrl: config.jira.url }))
    },
    deps: {
      config: CONFIG_TOKEN,
    },
  }),
  provide({
    provide: HOST_API_TOKEN,
    useFactory({
      commitsToNotes,
      releaseTypeByCommits,
      releaseType,
      preReleaseHooks,
      attributeReleaseData,
      config,
    }) {
      return {
        async commitsToNotes(commits, maybePkg: Pkg | undefined) {
          const filteredCommits = commits.filter(commit => {
            return commit.subject.indexOf('[pvm noshow]') === -1 && commit.body.indexOf(releaseMark) === -1
          })
          return commitsToNotes(filteredCommits, maybePkg, config)
        },
        releaseTypeByCommits(commits: Commit[], defaultValue = null) {
          return releaseTypeByCommits ? releaseTypeByCommits(commits) : Promise.resolve(defaultValue)
        },
        async releaseType(pkg: Pkg, changedContext: ChangedContext): Promise<PvmReleaseType | undefined> {
          return releaseType ? releaseType(pkg, changedContext) : undefined
        },
        async preReleaseHook(vcs: VcsPlatform, releaseContext: ReleaseContext) {
          return preReleaseHooks ? Promise.all(preReleaseHooks.map(h => h(vcs, releaseContext))) : []
        },
        async attributeReleaseData(releaseData: ReleaseData, updateState: UpdateState | null): Promise<ReleaseDataExt> {
          if (attributeReleaseData) {
            for (const proc of attributeReleaseData) {
              releaseData = await proc(releaseData, updateState)
            }
          }
          return releaseData
        },
      }
    },
    deps: {
      commitsToNotes: COMMITS_TO_NOTES_TOKEN,
      releaseTypeByCommits: { token: RELEASE_TYPE_BY_COMMITS_TOKEN, optional: true },
      releaseType: { token: RELEASE_TYPE_TOKEN, optional: true },
      preReleaseHooks: { token: PRE_RELEASE_HOOK_TOKEN, optional: true },
      attributeReleaseData: { token: ATTRIBUTE_RELEASE_DATA_HOOK_TOKEN, optional: true },
      config: CONFIG_TOKEN,
    },
  }),
  provide({
    provide: COMMITS_TO_NOTES_TOKEN,
    useValue: (commits, _maybePkg, config) => Promise.resolve(markdownifyCommits(commits, { jiraUrl: config.jira.url })),
  }),
  provide({
    provide: NOTIFY_SCRIPTS_PATH_TOKEN,
    useValue: () => Promise.resolve(path.resolve(__dirname, '../../lib/messages/notify-scripts')),
  }),
  provide({
    provide: VCS_TOKEN,
    useClass: DecoratedVcs,
    deps: {
      vcs: RAW_VCS_TOKEN,
      globalFlags: GLOBAL_FLAGS_TOKEN,
    },
  }),
  provide({
    provide: RAW_VCS_TOKEN,
    useClass: GitVcs,
    deps: {
      resolvePushRemote: RESOLVE_PUSH_REMOTE_TOKEN,
      config: CONFIG_TOKEN,
      cwd: CWD_TOKEN,
      globalFlags: GLOBAL_FLAGS_TOKEN,
    },
  }),
  provide({
    provide: VCS_PLATFORM_TOKEN,
    useFactory: ({
      vcsPlatformFactory,
    }) => {
      return vcsPlatformFactory({})
    },
    deps: {
      vcsPlatformFactory: VCS_PLATFORM_FACTORY_TOKEN,
    },
  }),
  provide({
    provide: VCS_PLATFORM_FACTORY_TOKEN,
    useFactory: (deps) => (customDeps) => {
      return new VcsPlatform({
        ...deps,
        ...customDeps,
      })
    },
    deps: {
      vcs: VCS_TOKEN,
      platform: PLATFORM_TOKEN,
      hostApi: HOST_API_TOKEN,
      cwd: CWD_TOKEN,
      globalFlags: GLOBAL_FLAGS_TOKEN,
    },
  }),
]
