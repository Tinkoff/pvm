export interface CliUpdateOpts {
  dryRun?: boolean,
  cwd?: string,
  local?: boolean,
  tagOnly?: boolean,
  releaseDataFile?: string,
  vcsMode?: 'platform' | 'vcs',
  format?: string,
}
