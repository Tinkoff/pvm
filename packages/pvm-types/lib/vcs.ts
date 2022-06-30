export enum PlatformResult {
  OK = 'OK',
  NOT_FOUND = 'E_NOTFND',
  NO_SUCH_TAG = 'E_NOSCHTAG',
}

export interface VcsRelease {
  name: string,
  tag_name: string,
  description: string,
  created_at: string,
  commit?: {
    id: string,
  },
}

export interface CommitResult {
  id: string,
}

export interface ReleasePayload {
  name: string,
  description: string,
}

export interface CreateReleasePayload extends ReleasePayload {
  annotation?: string | null,
}

export interface CommitOptions {
  branch?: string,
  allowEmpty?: boolean,
}

export interface PushOptions {
  remote?: string,
  refspec?: string,
  skipCi?: boolean,
  noTags?: boolean,
  pushOptions?: Map<string, string | true>,
}

export interface PlatformReleaseTag {
  name: string,
}

export interface MetaComment<Note> {
  metadata: Record<string, any>,
  content: string,
  note: Note,
}

export interface FileCommitApi<TCommitContext> {
  addFiles(commitContext: TCommitContext, filePaths: string[]): void,
  appendFile(commitContext: TCommitContext, filePath: string, content: string): void,
  beginCommit(): TCommitContext,
  rollbackCommit(commitContext: TCommitContext): Promise<void>,
  updateFile(commitContext: TCommitContext, file_path, content): void,
  deleteFile(commitContext: TCommitContext, file_path: string): void,
  commit(commitContext: TCommitContext, message: string, opts?: CommitOptions): Promise<CommitResult>,
}

export interface AbstractVcs<TCommitContext> extends FileCommitApi<TCommitContext> {
  fetchLatestSha(refName: string): Promise<string>,
  addTag(tag_name: string, ref: string): Promise<unknown>,
  push(opts?: PushOptions): Promise<void>,
  dryRun(): void,
  getCurrentBranch(): string | void,
  getHeadRev(): string,
  isLastAvailableRef(rev: string): boolean,
}

export interface AlterReleaseResult {
  id: string,
}

export interface PlatformRelease {
  name: string,
  description: string,
}

export interface AddTagOptions {
  annotation?: string | null,
}

export type GetReleaseResult = [PlatformResult.OK, PlatformRelease] | [PlatformResult.NOT_FOUND | PlatformResult.NO_SUCH_TAG, null]

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface UnknownCommitContext {
  _: 'unknown_cc',
}

export interface VcsOnly {
  isDryRun: boolean,
  cwd: string,
  beginCommit(): UnknownCommitContext,
  rollbackCommit(commitContext: UnknownCommitContext): Promise<void>,
  isSomethingForCommit(): boolean,
  addFiles(filePaths: string[]): Promise<unknown>,
  updateFile(filePath: string, content: string): Promise<unknown>,
  appendFile(filePath: string, content: string): Promise<unknown>,
  deleteFile(filePath: string): Promise<unknown>,
  commit(message: any, opts?: Record<string, unknown>): Promise<CommitResult | undefined>,
  push(opts?: PushOptions): Promise<unknown>,
  addTag(tagName: string, ref: string, opts?: AddTagOptions): Promise<void>,
}
