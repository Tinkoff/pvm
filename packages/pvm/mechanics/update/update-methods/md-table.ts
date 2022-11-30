import sortByRelease from '../../../lib/packages/sort-by-release'
import { MdUpdatedTable } from '../utils/md-table'
import type { UpdateState } from '../update-state'
import { UPDATE_MD_TABLE_EXTEND_TOKEN } from '../../../tokens'
import type { Container } from '../../../lib/di'

export async function run(di: Container, updateState: UpdateState): Promise<string | void> {
  if (updateState.isSomethingForRelease) {
    const updatedPackages = updateState.getReleasePackages()
    const changedPackagesSorted = sortByRelease(updatedPackages.keys(), updateState.getLikelyReleaseTypeFor.bind(updateState))
    const table = new MdUpdatedTable()

    await di.get(UPDATE_MD_TABLE_EXTEND_TOKEN)?.forEach(ext => ext(table))

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
