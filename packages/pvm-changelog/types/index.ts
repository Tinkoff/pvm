import type { ReleaseData } from '@pvm/releases/types'

export interface Renderer {
  render(releases: Iterable<ReleaseData>, forPkg?: string): string,
}

export interface IncrementalRenderer extends Renderer {
  append(changelog: string, release: ReleaseData, forPkg?: string): string,
}
