#!/usr/bin/env node
import { getUpdateState } from '../mechanics/update'
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
import { CONFIG_TOKEN, CWD_TOKEN, MARK_PR_HOOK_TOKEN, PLATFORM_TOKEN } from '../tokens'
import type { PlatformInterface } from '../mechanics/platform'
import type { CommandFactory } from '../types/cli'
import type { Config } from '../types'

async function analyzeUpdate(_di: Container, platform: PlatformInterface<any, any>, updateState: UpdateState): Promise<any> {
  const { warnings } = analyzeUpdatedPackages(updateState)

  if (warnings.length !== 0) {
    const warningsAsList = warnings.map(warning => `- ${warning}`).join('\n')
    await platform.syncText('analyze-report', `
**Dependencies between packages after update can lead to malfunctioning when installing dependencies or building a project.**

${warningsAsList}
`
    )
  } else {
    await platform.syncText('analyze-report', 'Dependencies between packages looks good.')
  }
}

async function packagesAsLabels(_di: Container, platform: PlatformInterface<any, any>, updateState: UpdateState): Promise<unknown> {
  return platform.ensureMrLabels(Array.from(updateState.getReleasePackages().keys()).map((pkg: Pkg) => pkg.shortName))
}

async function packagesTable(di: Container, platform: PlatformInterface<any, any>, updateState: UpdateState): Promise<unknown> {
  const md = await mdTable.run(di, updateState)
  return platform.syncText('packages-for-release', md || 'no packages for release')
}

async function packagesGraph(_di: Container, platform: PlatformInterface<any, any>, updateState: UpdateState): Promise<unknown> {
  if (!updateState.isSomethingForRelease) {
    return platform.syncText('packages-graph', 'no packages for release')
  }
  const dot = await graphDot.updateStateToDot(updateState)
  const svg: string = await renderDot(dot)
  await platform.syncAttachment('packages-graph', Buffer.from(svg), {
    filename: 'packages-graph.svg',
  })
}

async function attachChangelog(di: Container, platform: PlatformInterface<any, any>, updateState: UpdateState): Promise<unknown> {
  const releaseContext = await createReleaseContext(updateState)
  const changelog = releaseContext ? await renderReleaseContext(di, releaseContext, RenderTarget.markPr) : ''
  return platform.syncText('changelog-for-pr', changelog)
}

async function attachMigrationProcess(platform: PlatformInterface<any, any>, cwd: string): Promise<void> {
  const vcsStenographist = new VcsOnlyStenographer(cwd)

  if (!vcsStenographist.isEmpty) {
    await platform.syncText('pvm configuration migration transcript', vcsStenographist.join())
  }
}

interface Marker {
  fn(di: Container, platform: PlatformInterface<any, any>, updateState: UpdateState): Promise<unknown>,
  confKey: keyof Config['mark_pr'],
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

export default (di: Container): CommandFactory => builder => builder.command(
  'mark-pr',
  `Marks merge or pull request by project labels, packages about to update, etc`,
  {},
  async function main(): Promise<void> {
    const conf = di.get(CONFIG_TOKEN).mark_pr
    const platform = di.get(PLATFORM_TOKEN)
    const cwd = di.get(CWD_TOKEN)
    await platform.beginMrAttribution()

    await attachMigrationProcess(platform, cwd)

    const updateState = await getUpdateState(di)

    for (const marker of markers) {
      if (conf[marker.confKey]) {
        await marker.fn(di, platform, updateState)
      }
    }

    await di.get(MARK_PR_HOOK_TOKEN)?.forEach(hook => hook(platform, updateState))
  }
)
