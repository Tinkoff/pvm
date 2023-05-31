
export interface DiffStats {
  action: 'A' | 'C' | 'D' | 'M' | 'R'| 'T' | 'U' | 'X' | 'B',
  oldPath?: string,
  actionScore?: number,
}

export interface NamedDiff {
  [filePath: string]: DiffStats,
}

export interface RefRecord {
  long: string,
  short: string,
}

export interface Committer {
  name: string,
  email: string,
  date: Date,
}

export interface Commit {
  commit: RefRecord,
  tree: RefRecord,
  author: Committer,
  committer: Committer,
  subject: string,
  body: string,
}
