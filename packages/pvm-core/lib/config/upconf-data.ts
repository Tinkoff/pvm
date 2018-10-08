import path from 'path'
import fs from 'fs'

import type { UpconfData } from './types'

export function loadUpconfFile(cwd: string): false | UpconfData {
  const upconfPath = path.join(cwd, 'pvm-upconf.json')
  if (fs.existsSync(upconfPath)) {
    const contents = fs.readFileSync(upconfPath).toString('utf8')

    return JSON.parse(contents) as unknown as UpconfData
  }
  return false
}
