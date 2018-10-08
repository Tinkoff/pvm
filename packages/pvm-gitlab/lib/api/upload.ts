import type { HttpReqOptions } from '@pvm/core/lib/httpreq'
import glapi from './index'
import { debug } from '@pvm/core/lib/logger'

function uploadOpts(data: Buffer, filename: string): HttpReqOptions {
  const crlf = '\r\n'
  const boundary = Math.random().toString(16)
  const delimiter = `${crlf}--${boundary}`
  const headers = [
    `Content-Disposition: form-data; name="file"; filename="${filename}"`,
  ]
  const closeDelimiter = `${delimiter}--`

  const multipartBody = Buffer.concat([
    Buffer.from(delimiter + crlf + headers.join(crlf) + crlf + crlf),
    data,
    Buffer.from(closeDelimiter),
  ])

  return {
    body: multipartBody,
    method: 'POST',
    headers: {
      'Content-Type': `multipart/form-data; boundary=${boundary}`,
      'Content-Length': multipartBody.length,
    },
  }
}

function toSlug(projectId: string | number): string {
  return encodeURIComponent(String(projectId))
}

export interface UploadResult {
  alt: string,
  url: string,
  markdown: string,
}

// https://docs.gitlab.com/ee/api/projects.html#upload-a-file
async function uploadFile(projectId: string | number, data: Buffer, filename: string): Promise<UploadResult> {
  const opts = uploadOpts(data, filename)
  const { json } = await glapi(`/projects/${toSlug(projectId)}/uploads`, opts)
  debug('upload file result:\n', JSON.stringify(json, null, 2))

  return json
}

export {
  uploadFile,
}
