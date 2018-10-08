
export interface DiffStats {
  action: 'A' | 'C' | 'D' | 'M' | 'R'| 'T' | 'U' | 'X' | 'B',
  oldPath?: string,
  actionScore?: number,
}

export interface NamedDiff {
  [filePath: string]: DiffStats,
}
