import { cutText } from '@pvm/core/lib/text'
import padLines from '@pvm/core/lib/text/pad-lines'

import type { AddTagOptions, CommitResult, VcsOnly, UnknownCommitContext, PushOptions } from '../types'

function details(text: string, maxLen = 2000): string {
  return '<details>\n\n```\n' + cutText(text, maxLen) + '\n````\n\n</details>'
}

export interface LineEntry {
  title: string,
  body: string,
}

export class VcsOnlyStenographer implements VcsOnly {
  cwd: string
  _transcript: LineEntry[]
  isDryRun = true

  constructor(cwd: string) {
    this.cwd = cwd
    this._transcript = []
  }

  get isEmpty(): boolean {
    return this._transcript.length === 0
  }

  join(separator = '\n'): string {
    return this._transcript.map((line, index) => {
      let msg = `${index + 1}.  ${line.title}`
      if (line.body) {
        msg += '\n' + padLines(line.body, 4)
      }
      return msg
    }).join(separator)
  }

  beginCommit(): UnknownCommitContext {
    return {} as UnknownCommitContext
  }

  rollbackCommit(_commitContext: UnknownCommitContext): Promise<void> {
    // pass
    return Promise.resolve()
  }

  isSomethingForCommit(): boolean {
    return false
  }

  addTranscript(title: string, body = ''): Promise<void> {
    this._transcript.push({
      title,
      body,
    })
    return Promise.resolve()
  }

  addFiles(filePaths: string[]): Promise<unknown> {
    return this.addTranscript(`Add files ${filePaths.map(x => `"${x}"`).join(', ')} to vcs from fs.`)
  }

  updateFile(filePath: string, content: string): Promise<unknown> {
    return this.addTranscript(`Update file "${filePath}" to following text:`, details(content))
  }

  deleteFile(filePath: string): Promise<unknown> {
    return this.addTranscript(`Delete file "${filePath}".`)
  }

  addTag(tagName: string, ref: string, opts?: AddTagOptions): Promise<void> {
    const msg = [
      `Attach tag "${tagName}" to ref:"${ref}".`,
    ]
    let body = ''
    if (opts?.annotation) {
      msg.push(`With following annotation:`)
      body = details(opts.annotation)
    }
    return this.addTranscript(msg.join(' '), body)
  }

  appendFile(filePath: string, content: string): Promise<unknown> {
    return this.addTranscript(`Append file "${filePath}" by following content:`, details(content))
  }

  commit(message: string, _opts?: Record<string, unknown>): Promise<CommitResult | undefined> {
    return this.addTranscript(`Commit changes using following message: {"${message}"}`) as Promise<undefined>
  }

  push(opts: PushOptions = {}): Promise<unknown> {
    if (opts.refspec) {
      return this.addTranscript(`Push refspec ${opts.refspec}`)
    } else {
      return this.addTranscript(`Push new commits and all tags`)
    }
  }
}
