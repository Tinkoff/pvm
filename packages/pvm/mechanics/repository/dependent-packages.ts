import { PkgSet } from '../../lib/pkg-set'
import type { Pkg } from '../../lib/pkg'

type PkgNode = {
  parents: Set<PkgNode>,
  children: Set<PkgNode>,
  value: Pkg,
}

type PkgTree = {
  children: Set<PkgNode>,
}

function createPkgNode(pkg: Pkg): PkgNode {
  return {
    value: pkg,
    parents: new Set(),
    children: new Set(),
  }
}

export function buildDependantPackagesListIntoTree(packages: Pkg[]): PkgTree {
  const packagesByName = new PkgSet(packages)
  const nodesByName: Record<string, PkgNode> = {}
  const tree: PkgTree = {
    children: new Set(),
  }

  packages.forEach((pkg) => {
    const depsKeys = Object.keys({ ...pkg.meta.devDependencies, ...pkg.meta.peerDependencies, ...pkg.meta.dependencies })
    const publishedDepsKeys = depsKeys.filter((name) => packagesByName.has(name))
    const currentPkgName = pkg.meta.name

    if (!nodesByName[currentPkgName]) {
      nodesByName[currentPkgName] = createPkgNode(pkg)
    }

    const currentNode = nodesByName[currentPkgName]

    // рутовые ноды дерева - пакеты без зависимостей из списка публикуемых
    if (publishedDepsKeys.length === 0) {
      tree.children.add(currentNode)
    }

    publishedDepsKeys.forEach((pkgFromDepsName) => {
      if (!nodesByName[pkgFromDepsName]) {
        nodesByName[pkgFromDepsName] = createPkgNode(packagesByName.get(pkgFromDepsName)!)
      }

      const nodeFromDeps = nodesByName[pkgFromDepsName]

      // связываем зависимости и текущий пакет как родитель -> потомок
      nodeFromDeps.children.add(currentNode)
      currentNode.parents.add(nodeFromDeps)
    })
  })

  if (packages.length > 0 && tree.children.size === 0) {
    throw new Error('Packages for publish has cyclic dependencies, dependent publication is not possible')
  }

  return tree
}

export function visitDependantPackagesTree(tree: PkgTree, cb: (nodes: Set<PkgNode>) => void) {
  if (tree.children.size === 0) {
    return
  }

  // ожидается, что рутовые ноды дерева не имеют parents
  cb(tree.children)

  // после обработки рутовых нод, создаем новое дерево, таким образом отбрасывая уже обработанные
  const nextTree: PkgTree = {
    children: new Set(),
  }

  tree.children.forEach((node) => {
    node.children.forEach((childNode) => {
      childNode.parents.delete(node)

      // добавляем в новое дерево рутовые ноды без parents
      if (childNode.parents.size === 0) {
        nextTree.children.add(childNode)
      }
    })
  })

  visitDependantPackagesTree(nextTree, cb)
}
