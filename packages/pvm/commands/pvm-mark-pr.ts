#!/usr/bin/env node
import { getUpdateState } from '../mechanics/update'
import type { VcsPlatform } from '../mechanics/vcs/index'
import * as mdTable from '../mechanics/update/update-methods/md-table'
import * as graphDot from '../mechanics/update/update-methods/dot'
import { analyzeUpdate as analyzeUpdatedPackages } from '../mechanics/update/update-methods/analyze'
import { renderDot } from '../lib/viz'
import { renderReleaseContext, RenderTarget } from '../mechanics/changelog'
import { createReleaseContext } from '../mechanics/update/release/release-context'
import { VcsOnlyStenographer } from '../mechanics/vcs/vcs-only-stenographer'

import type { UpdateState } from '../mechanics/update/update-state'
import type { Pkg } from '../lib/pkg'
import type { Container } from '../lib/di'
import { CONFIG_TOKEN, MARK_PR_HOOK_TOKEN, VCS_PLATFORM_TOKEN } from '../tokens'

async function analyzeUpdate(_di: Container, vcs: VcsPlatform, updateState: UpdateState): Promise<any> {
  const { warnings } = analyzeUpdatedPackages(updateState)

  if (warnings.length !== 0) {
    const warningsAsList = warnings.map(warning => `- ${warning}`).join('\n')
    await vcs.syncText('analyze-report', `
**Dependencies between packages after update can lead to malfunctioning when installing dependencies or building a project.**

${warningsAsList}
`
    )
  } else {
    await vcs.syncText('analyze-report', 'Dependencies between packages looks good.')
  }
}

async function packagesAsLabels(_di: Container, vcs: VcsPlatform, updateState: UpdateState): Promise<unknown> {
  return vcs.ensureMrLabels(Array.from(updateState.getReleasePackages().keys()).map((pkg: Pkg) => pkg.shortName))
}

async function packagesTable(di: Container, vcs: VcsPlatform, updateState: UpdateState): Promise<unknown> {
  const md = await mdTable.run(di, updateState)
  return vcs.syncText('packages-for-release', md || 'no packages for release')
}

async function packagesGraph(_di: Container, vcs: VcsPlatform, updateState: UpdateState): Promise<unknown> {
  if (!updateState.isSomethingForRelease) {
    return vcs.syncText('packages-graph', 'no packages for release')
  }
  const dot = await graphDot.updateStateToDot(updateState)
  const svg: string = await renderDot(dot)
  await vcs.syncAttachment('packages-graph', Buffer.from(svg), {
    filename: 'packages-graph.svg',
  })
}

async function attachChangelog(di: Container, vcs: VcsPlatform, updateState: UpdateState): Promise<unknown> {
  const releaseContext = await createReleaseContext(updateState)
  const changelog = releaseContext ? await renderReleaseContext(di, releaseContext, RenderTarget.markPr) : ''
  return vcs.syncText('changelog-for-pr', changelog)
}

async function attachMigrationProcess(vcs: VcsPlatform): Promise<void> {
  const vcsStenographist = new VcsOnlyStenographer(vcs.cwd)

  if (!vcsStenographist.isEmpty) {
    await vcs.syncText('pvm configuration migration transcript', vcsStenographist.join())
  }
}

interface Marker {
  fn(di: Container, vcs: VcsPlatform, updateState: UpdateState): Promise<unknown>,
  confKey: string,
}

const markers: Marker[] = [
  {
    fn: analyzeUpdate,
    confKey: 'analyze_update',
  },
  {
    fn: packagesAsLabels,
    confKey: 'packages_as_labels',
  },
  {
    fn: packagesTable,
    confKey: 'packages_table',
  },
  {
    fn: packagesGraph,
    confKey: 'packages_graph',
  },
  {
    fn: attachChangelog,
    confKey: 'attach_changelog',
  },
]

export default (di: Container) => ({
  command: 'mark-pr',
  description: `Marks merge or pull request by project labels, packages about to update, etc`,
  handler: async function main(): Promise<void> {
    const conf = di.get(CONFIG_TOKEN).mark_pr
    const vcs = di.get(VCS_PLATFORM_TOKEN)
    await vcs.beginMrAttribution()

    await attachMigrationProcess(vcs)

    const updateState = await getUpdateState(di)

    for (const marker of markers) {
      if (conf[marker.confKey]) {
        await marker.fn(di, vcs, updateState)
      }
    }

    await di.get(MARK_PR_HOOK_TOKEN)?.forEach(hook => hook(vcs, updateState))
  },
})