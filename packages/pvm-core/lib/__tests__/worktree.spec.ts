import { cwdToGitRelativity, gitToCwdRelativity } from '../git/worktree'

describe('core/worktree/cwdToGitRelativity', () => {
  it('should return "." if dot passed and cwd match git root', () => {
    expect(cwdToGitRelativity('c:/root', '.', () => 'c:/root')).toBe('.')
  })

  it('should return subpath if dot passed and cwd not match git root', () => {
    expect(cwdToGitRelativity('c:/root/subroot', '.', () => 'c:/root')).toBe('subroot')
  })

  it('should return input path if cwd same as git root', () => {
    expect(cwdToGitRelativity('c:/root', 'test', () => 'c:/root')).toBe('test')
  })

  it('should add subpath from git root to cwd', () => {
    expect(cwdToGitRelativity('c:/root/subroot', 'test', () => 'c:/root')).toBe('subroot/test')
  })

  it('should handle back slash', () => {
    expect(cwdToGitRelativity('c:\\root\\subroot', 'test', () => 'c:/root')).toBe('subroot/test')
  })
})

describe('core/worktree/gitToCwdRelativity', () => {
  it('should return input path if cwd same as git root', () => {
    expect(gitToCwdRelativity('c:/root', 'test', () => 'c:/root')).toBe('test')
  })

  it('should add subpath from git root to cwd', () => {
    expect(gitToCwdRelativity('c:/root/subroot', 'subroot/test', () => 'c:/root')).toBe('test')
  })

  it('should handle back slash', () => {
    expect(gitToCwdRelativity('c:\\root\\subroot', 'subroot/test', () => 'c:/root')).toBe('test')
  })
})
