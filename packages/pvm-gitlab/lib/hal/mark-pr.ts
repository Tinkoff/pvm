import parseMd from 'parse-md'
import { debug } from '@pvm/core/lib/logger'
import crypto from 'crypto'
import path from 'path'

import glapi from '../api'
import getNotes from '../api/mr/notes'
import { uploadFile } from '../api/upload'
import gitlabEnv from '../env'

import type { MrNote } from '../../types/api/notes'
import type { HttpResponseSuccess } from '@pvm/core/lib/httpreq'
import type { MetaComment } from '@pvm/vcs/types/index'
import { getNoteBody } from '@pvm/vcs/lib'

async function findNote(iid: number, kind: string): Promise<MetaComment<MrNote> | void> {
  const notesIterator = getNotes(gitlabEnv.projectId, iid)

  for await (const note of notesIterator) {
    let parseResult
    try {
      parseResult = parseMd(note.body)
    } catch (e) {
      console.error(`couldn't parse comment for note with id=${note.id}, skip it`)
      console.error(e)
      continue
    }
    const { metadata, content } = parseResult

    if (metadata && metadata.kind === kind) {
      return {
        metadata,
        content,
        note,
      }
    }
  }
}

async function syncText(iid: number, kind: string, text: string): Promise<HttpResponseSuccess> {
  const existsNote = await findNote(iid, kind)

  const noteBody = getNoteBody([['kind', kind], ['ref', gitlabEnv.commitSha]], text)

  if (existsNote) {
    return glapi(`/projects/${gitlabEnv.projectSlug}/merge_requests/${iid}/notes/${existsNote.note.id}`, {
      method: 'PUT',
      body: {
        body: noteBody,
      },
    })
  } else {
    return glapi(`/projects/${gitlabEnv.projectSlug}/merge_requests/${iid}/notes`, {
      method: 'POST',
      body: {
        body: noteBody,
      },
    })
  }
}

export interface SyncAttachmentOpts {
  filename?: string,
}

async function syncAttachment(iid: number, kind: string, attachment: Buffer, opts: SyncAttachmentOpts = {}): Promise<HttpResponseSuccess> {
  const existsNote: MetaComment<MrNote> | void = await findNote(iid, kind)
  const { filename = 'attachment.file' } = opts

  let markdown

  if (existsNote) {
    const { metadata, content } = existsNote

    let doUpload = true
    try {
      if (metadata.integrity) {
        const [algo, attachDigest] = metadata.integrity.split('-')
        const digest = crypto.createHash(algo).update(attachment).digest('hex')
        doUpload = attachDigest !== digest
        debug('integrity match:', !doUpload)
      }
    } catch (e) {
      debug(e)
    }

    if (doUpload) {
      markdown = (await uploadFile(gitlabEnv.projectId, attachment, path.basename(filename))).markdown
    } else {
      markdown = content
    }
  } else {
    markdown = (await uploadFile(gitlabEnv.projectId, attachment, path.basename(filename))).markdown
  }

  const digest = crypto.createHash('sha1').update(attachment).digest('hex')

  const noteBody = getNoteBody([['kind', kind], ['ref', gitlabEnv.commitSha], ['integrity', `sha1-${digest}`]], markdown)

  if (existsNote) {
    return glapi(`/projects/${gitlabEnv.projectSlug}/merge_requests/${iid}/notes/${existsNote.note.id}`, {
      method: 'PUT',
      body: {
        body: noteBody,
      },
    })
  } else {
    return glapi(`/projects/${gitlabEnv.projectSlug}/merge_requests/${iid}/notes`, {
      method: 'POST',
      body: {
        body: noteBody,
      },
    })
  }
}

export {
  findNote,
  syncText,
  syncAttachment,
}
