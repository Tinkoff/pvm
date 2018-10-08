import fs from 'fs'
import { mema } from './memoize/mema'

export function mkdirp(dir: string): void {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, {
      recursive: true,
    })
  }
}

export function escapeFilePath(fp: string): string {
  if (!/\s/.test(fp)) {
    return fp
  }
  return `"${fp.replace(/"/g, '\\"')}"`
}

export const cachedRealPath = mema((dir: string) => fs.realpathSync(dir))
