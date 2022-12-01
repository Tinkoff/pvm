import stringToColor from 'string-to-color'
import { logger, log } from '../../lib/logger'
import type {
  CommitOptions, CommitResult,
  CreateReleasePayload, FileCommitApi,
  GetReleaseResult, MetaComment, PlatformReleaseTag,
  ReleasePayload,
  VcsRelease,
  AddTagOptions, HostApi,
} from '../../types'
import { getNoteBody } from '../vcs/utils'
import { logDryRun } from '../../lib/utils'
import { PlatformResult } from '../../lib/shared'
import getCommits from '../../lib/git/commits'

export abstract class PlatformInterface<MergeRequest, CommitContext> implements FileCommitApi<CommitContext> {
  name: string
  dryRun: boolean
  protected abstract cwd: string
  protected abstract hostApi: HostApi
  abstract requireMr(): MergeRequest;
  abstract getCommitLink(commit: string): Promise<string | null>;
  /** Создает и тег и релиз, если тег уже есть то выбрасывается исключение */
  abstract addTagAndRelease(ref: string, tag_name: string, data: CreateReleasePayload): Promise<unknown>;
  /** Создает релиз на существующем теге */
  abstract createRelease(tagName: string, payload: CreateReleasePayload): Promise<unknown>;
  /** Возвращает релиз, если есть, для существующего тега. Результат если тега нет или нет релиза отличается по коду ответа */
  abstract getRelease(tagName: string): Promise<GetReleaseResult>;
  /** Редактирует существующий релиз, если нет релиза или тега будет ошибка */
  abstract editRelease(tag_name: string, data: ReleasePayload): Promise<unknown>;
  /** Редактирует или создает релиз, тег должен существовать */
  abstract upsertRelease(tag_name: string, data: ReleasePayload): Promise<unknown>;
  abstract releasesIterator(): AsyncGenerator<VcsRelease, void, any>;
  abstract releaseTagsIterator(): AsyncGenerator<PlatformReleaseTag, void, any>;
  abstract syncAttachment(kind: string, attachment: Buffer, opts: any): Promise<unknown>;
  abstract beginMrAttribution(): void;
  // common with AbstractVcs
  abstract fetchLatestSha(refName: string): Promise<string>;
  abstract getCurrentBranch(): string | undefined
  abstract getCommitSha(): string
  abstract addTag(tag_name: string, ref: string, opts?: AddTagOptions): Promise<unknown>;

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

  @logDryRun
  async syncText(kind: string, text: string): Promise<unknown> {
    if (this.dryRun) {
      return
    }

    const existingNote = await this.findMrNote(kind)

    const noteBody = getNoteBody([['kind', kind], ['ref', this.getCommitSha()]], text)

    if (existingNote) {
      return this.updateMrNote(existingNote.note.id, noteBody)
    } else {
      return this.createMrNote(noteBody)
    }
  }

  @logDryRun
  async ensureMrLabels(labels: string[]): Promise<unknown> {
    if (this.dryRun) {
      return
    }

    const labelsByName = Object.create(null)
    for await (const label of this.getProjectLabels()) {
      labelsByName[label.name] = label
    }

    const newLabels: string[] = []

    for (const line of labels) {
      if (line in labelsByName) {
        continue
      }
      const color = stringToColor(line)
      logger.debug(`creating label ${line}, color ${color}`)

      await this.createProjectLabel(line, color)
      newLabels.push(line)
    }

    if (newLabels.length !== 0) {
      log(`Successfully created new labels: ${newLabels.join(', ')}`)
    }

    return this.setMrLabels(labels)
  }

  async prepareReleaseData(targetTag: string, prevRef: string): Promise<ReleasePayload> {
    log(`making release for ${targetTag} tag`)
    const commits = await getCommits(this.cwd, prevRef, targetTag)

    log(`generating release notes from commits ${prevRef}..${targetTag}`)
    const releaseNotes = await this.hostApi.commitsToNotes(commits)

    return {
      name: targetTag,
      description: releaseNotes,
    }
  }

  @logDryRun
  async makeReleaseForTag(tagObject, prevRef: string): Promise<void> {
    if (this.dryRun) {
      return
    }

    const releaseData = await this.prepareReleaseData(tagObject.name, prevRef)

    // цель: обновить у существующего тега/релиза description в не зависимости от наличия релиза
    await this.upsertRelease(tagObject.name, releaseData)

    log(`release notes for ${tagObject.name} have written successfully`)
  }

  // тег должен существовать
  @logDryRun
  async makeReleaseForTagName(tagName: string, prevRef: string, opts: {
    skipIfExists?: boolean,
  } = {}): Promise<void> {
    if (this.dryRun) {
      return
    }

    const { skipIfExists = false } = opts
    const releaseData = await this.prepareReleaseData(tagName, prevRef)

    const [responseCode, maybeRelease] = await this.getRelease(tagName)

    if (responseCode === PlatformResult.OK) {
      if (!maybeRelease!.description || !skipIfExists) {
        await this.editRelease(tagName, releaseData)
      } else {
        log(`release notes for ${tagName} already exists, skipping`)
        return
      }
    } else if (responseCode === PlatformResult.NOT_FOUND) { // тег есть, но нет релиза
      await this.createRelease(tagName, releaseData)
    } else if (responseCode === PlatformResult.NO_SUCH_TAG) {
      throw new Error(`Couldn't write release notes for tag "${tagName}". It doesn't exist.`)
    }

    log(`release notes for ${tagName} have written successfully`)
  }

  abstract addFiles(commitContext: CommitContext, filePaths: string[]): void;

  abstract appendFile(commitContext: CommitContext, filePath: string, content: string): void;

  abstract beginCommit(): CommitContext;

  abstract commit(commitContext: CommitContext, message: string, opts?: CommitOptions): Promise<CommitResult>;

  abstract deleteFile(commitContext: CommitContext, file_path: string): void;

  abstract rollbackCommit(commitContext: CommitContext): Promise<void>;

  abstract updateFile(commitContext: CommitContext, file_path, content): void;
}
