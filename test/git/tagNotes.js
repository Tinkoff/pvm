const path = require('path')
const fs = require('fs-extra')
const { promisify } = require('util')
const writeFile = promisify(fs.writeFile)

function safeTagName(tagName) {
  return tagName.replace(/\//g, '_')
}

// на данный момент здесь нет различий между пустым release notes и отсутствием релиза
// поэтому это надо учитывать при написании тестов
const tagNotes = (dir, tagName) => {
  const tagPath = path.join(dir, `.git/releases/${safeTagName(tagName)}`)
  return fs.existsSync(tagPath) ? fs.readFileSync(tagPath, 'utf-8').trim() : ''
}

const setTagNotes = async (dir, tagName, notes) => {
  const fullPath = path.join(dir, `.git/releases/${safeTagName(tagName)}`)

  return writeFile(fullPath, notes)
}

exports.tagNotes = tagNotes
exports.setTagNotes = setTagNotes
