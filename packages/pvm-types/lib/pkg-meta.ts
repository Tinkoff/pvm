export type PkgDeps = Record<string, string>

export interface PublishConfig {
  registry?: string,
  access?: string,
}

export interface MetaRepository {
  type: string,
  url: string,
  directory?: string,
}

export interface PkgMeta {
  version?: string,
  initialVersion?: string,
  name: string,
  dependencies?: PkgDeps,
  devDependencies?: PkgDeps,
  peerDependencies?: PkgDeps,
  optionalDependencies?: PkgDeps,
  private?: boolean,
  publishConfig?: PublishConfig,
  repository?: MetaRepository | string,
  workspaces?: string[] | { packages: string[] },
}

export interface PkgAppliedMeta extends PkgMeta {
  version: string,
}
