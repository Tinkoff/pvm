import type { UpdateReasonType } from '@pvm/update/lib/update-state'

export interface PkgIdentity {
  name: string,
  version: string,
}

export interface PkgReleaseEntry extends PkgIdentity {
  updateReason: UpdateReasonType,
  changed: boolean,
}
export interface ReleaseData {
  title: string,
  description: string,
  tag_name: string,
  created_at: string,
  refs: [string, string],
  packages: PkgReleaseEntry[],
}

export interface ReleaseDataExt extends ReleaseData {
  [key: string]: any,
}
