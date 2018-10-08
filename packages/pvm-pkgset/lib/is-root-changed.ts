import binarySearch from './utils/binary-search'

function isRootChanged(sortedWorkspaces: string[], fileList: string[]): boolean {
  for (const filePath of fileList) {
    const indexInWorkspaces = binarySearch(
      sortedWorkspaces,
      pkgPath => `${filePath}/`.startsWith(`${pkgPath}/`),
      pkgPath => filePath > `${pkgPath}/`
    )

    if (indexInWorkspaces === -1) {
      return true
    }
  }
  return false
}

export default isRootChanged
