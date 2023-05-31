export interface StorageImpl {
  init(): Promise<void>,
  finish(): Promise<void>,
  downloadPath(remotePath: string, localDest: string): Promise<unknown>,
  uploadPath(localPath: string, remoteDest: string): Promise<unknown>,
}

export interface IOOpts {
  force?: boolean,
}
