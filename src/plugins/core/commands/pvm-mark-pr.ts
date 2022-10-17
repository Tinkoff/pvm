#!/usr/bin/env node
import { getHostApi } from '@pvm/core/lib/plugins'
import { getUpdateState } from '@pvm/update/lib'
import type { Vcs } from '@pvm/vcs/lib'
import { initVcsPlatform } from '@pvm/vcs/lib'
import { getConfig } from '@pvm/core/lib/config'
import * as mdTable from '@pvm/update/lib/update-methods/md-table'
import * as graphDot from '@pvm/update/lib/update-methods/dot'
import { analyzeUpdate as analyzeUpdatedPackages } from '@pvm/update/lib/update-methods/analyze'
import { renderDot } from '@pvm/viz/lib'
import { renderReleaseContext, RenderTarget } from '@pvm/changelog/lib'
import { createReleaseContext } from '@pvm/update/lib/release/release-context'
import { VcsOnlyStenographer } from '@pvm/vcs/lib/vcs-only-stenographer'

import type { UpdateState } from '@pvm/update/lib/update-state'
import type { Pkg } from '@pvm/core/lib/pkg'

export const command = 'mark-pr'
export const description = `Marks merge or pull request by project labels, packages about to update, etc`
export const handler = main

async function analyzeUpdate(vcs: Vcs, updateState: UpdateState): Promise<any> {
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

async function packagesAsLabels(vcs: Vcs, updateState: UpdateState): Promise<unknown> {
  return vcs.ensureMrLabels(Array.from(updateState.getReleasePackages().keys()).map((pkg: Pkg) => pkg.shortName))
}

async function packagesTable(vcs: Vcs, updateState: UpdateState): Promise<unknown> {
  const md = await mdTable.run(updateState)
  return vcs.syncText('packages-for-release', md || 'no packages for release')
}

async function packagesGraph(vcs: Vcs, updateState: UpdateState): Promise<unknown> {
  if (!updateState.isSomethingForRelease) {
    return vcs.syncText('packages-graph', 'no packages for release')
  }
  const dot = await graphDot.updateStateToDot(updateState)
  const svg: string = await renderDot(dot)
  await vcs.syncAttachment('packages-graph', Buffer.from(svg), {
    filename: 'packages-graph.svg',
  })
}

async function attachChangelog(vcs: Vcs, updateState: UpdateState): Promise<unknown> {
  const releaseContext = await createReleaseContext(updateState)
  const changelog = releaseContext ? await renderReleaseContext(releaseContext, RenderTarget.markPr) : ''
  return vcs.syncText('changelog-for-pr', changelog)
}

async function attachMigrationProcess(vcs: Vcs): Promise<void> {
  const vcsStenographist = new VcsOnlyStenographer(vcs.cwd)

  if (!vcsStenographist.isEmpty) {
    await vcs.syncText('pvm configuration migration transcript', vcsStenographist.join())
  }
}

interface Marker {
  fn(vcs: Vcs, updateState: UpdateState): Promise<unknown>,
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

async function main(): Promise<void> {
  const conf = (await getConfig()).mark_pr
  const hostApi = await getHostApi()
  const vcs = await initVcsPlatform()
  await vcs.beginMrAttribution()

  await attachMigrationProcess(vcs)

  const updateState = await getUpdateState()

  for (const marker of markers) {
    if (conf[marker.confKey]) {
      await marker.fn(vcs, updateState)
    }
  }

  await hostApi.plEachSeries('mark-pr', vcs, updateState)
}
