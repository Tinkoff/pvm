import stringToColor from 'string-to-color'
import { debug, log } from '@pvm/core/lib/logger'
import type {
  AlterReleaseResult, CommitOptions, CommitResult,
  CreateReleasePayload, FileCommitApi,
  GetReleaseResult, MetaComment, PlatformReleaseTag,
  ReleasePayload,
  VcsRelease,
} from '../types/index'
import { getNoteBody } from './utils'

export abstract class PlatformInterface<MergeRequest> {
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

  abstract getProjectLabels(): AsyncIterable<Array<{ name: string }>>;
  abstract createProjectLabel(label: string, color: string): Promise<unknown>;
  abstract setMrLabels(labels: string[]): Promise<unknown>;

  async syncText(kind: string, text: string): Promise<unknown> {
    const existingNote = await this.findMrNote(kind)

    const noteBody = getNoteBody([['kind', kind], ['ref', this.getCommitSha()]], text)

    if (existingNote) {
      return this.updateMrNote(existingNote.note.id, noteBody)
    } else {
      return this.createMrNote(noteBody)
    }
  }

  async ensureMrLabels(labels: string[]): Promise<unknown> {
    const labelsByName = Object.create(null)
    for await (const labels of this.getProjectLabels()) {
      labels.forEach(label => {
        labelsByName[label.name] = label
      })
    }

    const newLabels: string[] = []

    for (const line of labels) {
      if (line in labelsByName) {
        continue
      }
      const color = stringToColor(line)
      debug(`creating label ${line}, color ${color}`)

      await this.createProjectLabel(line, color)
      newLabels.push(line)
    }

    if (newLabels.length !== 0) {
      log(`Successfully created new labels: ${newLabels.join(', ')}`)
    }

    return this.setMrLabels(labels)
  }
}

export abstract class PlatformInterfaceWithFileCommitApi<TMergeRequest, TCommitContext> extends PlatformInterface<TMergeRequest> implements FileCommitApi<TCommitContext> {
  supportsFileCommitApi = true

  abstract addFiles(commitContext: TCommitContext, filePaths: string[]): void;

  abstract appendFile(commitContext: TCommitContext, filePath: string, content: string): void;

  abstract beginCommit(): TCommitContext;

  abstract commit(commitContext: TCommitContext, message: string, opts?: CommitOptions): Promise<CommitResult>;

  abstract deleteFile(commitContext: TCommitContext, file_path: string): void;

  abstract rollbackCommit(commitContext: TCommitContext): Promise<void>;

  abstract updateFile(commitContext: TCommitContext, file_path, content): void;
}
