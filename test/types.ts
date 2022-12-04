import type {
  Config,
  Container, ExecShellOptions,
  HostApi,
  PkgMeta,
  RecursivePartial, RunShellOptions,
} from '@pvm/pvm'
import type { Pkg } from '@pvm/pvm/lib/pkg'
import type { ExecSyncOptions } from 'child_process'
import type { UpdateState } from '@pvm/pvm/mechanics/update/update-state'
import type { ExecResult } from '../packages/pvm/lib/shell/exec'
import type { User } from './fixtures/users'

export interface RepoTestApi {
  dir: string,
  cwd: string,
  // todo: remove if not used
  data: any,
  config: Config,
  di: Container,
  env: {
    CI_PROJECT_ID: string,
    CI_COMMIT_SHA: string,
    CI_COMMIT_REF_NAME: string,
  },
  head: string,
  shell(cmd: string, opts?: ExecSyncOptions): string,
  updateConfig(config: RecursivePartial<Config>): Promise<void>,
  syncConfig(): Promise<void>,
  getHostApi(): HostApi,
  approvers(pickAttr?: keyof User): Array<User> | Array<User[keyof User]>,
  setApprovers(usernames: string[]): void
  lastReleaseTag(): string,
  getUpdateState(): Promise<UpdateState>,
  readPkg(pkgPath: string): PkgMeta,
  updatePkg(pkgPath: string, patch: RecursivePartial<PkgMeta>): void,
  pkgVersion(pkgPath: string): string | undefined,
  tags(ref?: string): string[],
  pkgTags(ref?: string): string[],
  pkgTagsAll(): string[],
  runScript(cmd: string, opts?: RunShellOptions): Promise<void>,
  execScript(cmd: string, opts?: ExecShellOptions): Promise<ExecResult>,
  mkdir(dir: string): void,
  glApiStats(resourceId: string): Promise<Record<string, any>>
  addPkg(pkgPath: string, pkg: PkgMeta): Promise<void>,
  writeFile(filepath: string, contents: string, commit?: string): Promise<void>,
  rm(path: string): Promise<void>,
  touch(filepaths: string[] | string, commitMessage?: string): Promise<void>,
  tag(tagName: string, notes?: string): Promise<void>,
  annotatedTag(tagName: string, annotation: string, ref?: string): Promise<void>,
  loadPkg(pkgPath: string, ref?: string): Pkg | null,
  linkNodeModules(): Promise<void>,
  commit(message: string): Promise<void>,
  commitAll(message: string): Promise<void>,
  lastReleaseNotes(): string,
  tagNotes(tagName: string): string,
  getTagAnnotation(tagName: string): string,
  readFile(relPath: string, encoding?: 'utf8' | 'ascii' | 'hex'): string,
  existsPath(relPath: string): boolean,
}

export type PkgDir = string
export type PkgName = string
export type PkgPath = `${PkgDir}/${PkgName}`
export type PkgVersion = string
export type PkgSpec = `${PkgPath}@${PkgVersion}`

export type RepoSpec = {
  name: string,
  version?: PkgVersion,
  spec: `${PkgSpec}` | `${PkgSpec},${PkgSpec}` | `${PkgSpec},${PkgSpec},${PkgSpec}` | `${PkgSpec},${PkgSpec},${PkgSpec},${PkgSpec}` | PkgSpec[],
  deps?: Record<PkgName, PkgName | PkgName[]>
  private?: boolean
}

export type RepoPkg = {
  name: PkgName,
  path: `${PkgDir}/${PkgName}`,
  version: PkgVersion,
  dependencies?: Record<PkgName, PkgVersion>
}

export type Repo = {
  packages: Map<PkgName, RepoPkg>,
  name: PkgName,
  version?: PkgVersion,
  workspaces: Set<string>,
  private?: boolean
}

export type GitlabCommit = {
  id: string,
  short_id: string,
  title: string,
  created_at: string,
  message: string,
  author_name: string,
  author_email: string,
  author_date: string,
  committer_name: string,
  committer_email: string,
  committer_date: string,
}
