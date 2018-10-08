
import { exclude } from '../smart-paths'

const workspaces = [
  'src/a',
  'src/ab',
  'src/b',
  'src/ba',
].sort()

describe('pkgset/smart-paths', () => {
  it('should exclude files by root pattern', () => {
    const fileList = [
      'package.json',
      'src/a/foo.js',
      'src/b/package.json',
    ]
    expect(exclude(workspaces, fileList, ['/package.json'])).toEqual(fileList.slice(1))
    expect(exclude(workspaces, fileList, [
      '/package.json',
      '/src/a/*.js',
    ])).toEqual(fileList.slice(2))
  })

  it('should exclude files by workspace pattern', () => {
    const fileList = [
      'package.json',
      'src/a/foo.js',
      'src/b/package.json',
    ]

    expect(exclude(workspaces, fileList, [':package.json'])).toEqual(fileList.slice(0, 2))
    expect(exclude(workspaces, fileList, [':*.json'])).toEqual(fileList.slice(0, 2))
  })

  it('should exclude files by any micromatch pattern', () => {
    const fileList = [
      'package.json',
      'src/a/foo.js',
      'src/b/package.json',
    ]

    expect(exclude(workspaces, fileList, ['**/package.json'])).toEqual(fileList.slice(1, 2))
    expect(exclude(workspaces, fileList, ['**/**.json'])).toEqual(fileList.slice(1, 2))
    expect(exclude(workspaces, fileList, ['**/a/*.js'])).toEqual([
      'package.json',
      'src/b/package.json',
    ])
  })
})
