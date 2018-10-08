import sortByRelease from '@pvm/core/lib/packages/sort-by-release'
import { MdUpdatedTable } from '../utils/md-table'
import type { UpdateState } from '../update-state'

export async function run(updateState: UpdateState): Promise<string | void> {
  if (updateState.isSomethingForRelease) {
    const updatedPackages = updateState.getReleasePackages()
    const changedPackagesSorted = sortByRelease(updatedPackages.keys(), updateState.getLikelyReleaseTypeFor.bind(updateState))
    const table = new MdUpdatedTable()

    const hostApi = await updateState.repo.getHostApi()

    await hostApi.plEachSeries('md.table', table)

    for (const oldPkg of changedPackagesSorted) {
      const newPkg = updatedPackages.get(oldPkg)!
      table.addRow({
        newPkg,
        oldPkg,
        updateState,
      })
    }

    return table.build()
  }
}
