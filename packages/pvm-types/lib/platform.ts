import type {
  AlterReleaseResult, CommitOptions, CommitResult,
  CreateReleasePayload, FileCommitApi,
  GetReleaseResult, MetaComment, PlatformReleaseTag,
  ReleasePayload,
  VcsRelease,
} from './vcs'

export abstract class BasePlatformInterface<MergeRequest> {
  currentMr: MergeRequest | null;
  abstract requireMr(): MergeRequest;
  abstract getCommitLink(commit: string): Promise<string | null>;
  /** Создает и тег и релиз, если тег уже есть то выбрасывается исключение */
  abstract addTagAndRelease(ref: string, tag_name: string, data: CreateReleasePayload): Promise<AlterReleaseResult>;
  /** Создает релиз на существующем теге */
  abstract createRelease(tagName: string, payload: CreateReleasePayload): Promise<AlterReleaseResult>;
  /** Возвращает релиз, если есть, для существующего тега. Результат если тега нет или нет релиза отличается по коду ответа */
  abstract getRelease(tagName: string): Promise<GetReleaseResult>;
  /** Редактирует существующий релиз, если нет релиза или тега будет ошибка */
  abstract editRelease(tag_name: string, data: ReleasePayload): Promise<AlterReleaseResult>;
  /** Редактирует или создает релиз, тег должен существовать */
  abstract upsertRelease(tag_name: string, data: ReleasePayload): Promise<unknown>;
  abstract releasesIterator(): AsyncGenerator<VcsRelease, void, any>;
  abstract releaseTagsIterator(): AsyncGenerator<PlatformReleaseTag, void, any>;
  abstract syncAttachment(kind: string, attachment: Buffer, opts: any): Promise<unknown>;
  abstract beginMrAttribution(): void;
  // common with AbstractVcs
  abstract fetchLatestSha(refName: string): Promise<string>;
  abstract getCurrentBranch(cwd: string): string | undefined
  abstract getCommitSha(): string
  abstract addTag(tag_name: string, ref: string): Promise<unknown>;

  abstract findMrNote(kind: string): Promise<MetaComment<{
    body: string,
    id: string | number,
  }> | void>;

  abstract createMrNote(body: string): Promise<unknown>;
  abstract updateMrNote(commentId: number | string, body: string): Promise<unknown>;

  abstract getProjectLabels(): AsyncIterable<{ name: string }>;
  abstract createProjectLabel(label: string, color: string): Promise<unknown>;
  abstract setMrLabels(labels: string[]): Promise<unknown>;

  abstract getUpdateHintsByCommit(commit: string): Promise<Record<string, any> | null>;

  abstract syncText(kind: string, text: string): Promise<unknown>;

  abstract ensureMrLabels(labels: string[]): Promise<unknown>;
}

export abstract class BasePlatformInterfaceWithFileCommitApi<TMergeRequest, TCommitContext> extends BasePlatformInterface<TMergeRequest> implements FileCommitApi<TCommitContext> {
  supportsFileCommitApi = true

  abstract addFiles(commitContext: TCommitContext, filePaths: string[]): void;

  abstract appendFile(commitContext: TCommitContext, filePath: string, content: string): void;

  abstract beginCommit(): TCommitContext;

  abstract commit(commitContext: TCommitContext, message: string, opts?: CommitOptions): Promise<CommitResult>;

  abstract deleteFile(commitContext: TCommitContext, file_path: string): void;

  abstract rollbackCommit(commitContext: TCommitContext): Promise<void>;

  abstract updateFile(commitContext: TCommitContext, file_path, content): void;
}
