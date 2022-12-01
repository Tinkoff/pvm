import path from 'path'
import fs from 'fs-extra'

function safeTagName(tagName: string) {
  return tagName.replace(/\//g, '_')
}

// на данный момент здесь нет различий между пустым release notes и отсутствием релиза
// поэтому это надо учитывать при написании тестов
export const tagNotes = (dir: string, tagName: string) => {
  const tagPath = path.join(dir, `.git/releases/${safeTagName(tagName)}`)
  return fs.existsSync(tagPath) ? fs.readFileSync(tagPath, 'utf-8').trim() : ''
}

export const setTagNotes = async (dir: string, tagName: string, notes: string) => {
  const fullPath = path.join(dir, `.git/releases/${safeTagName(tagName)}`)

  return fs.writeFile(fullPath, notes)
}
