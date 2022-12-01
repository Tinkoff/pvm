import semver from 'semver'
import type { AppliedPkg, Pkg } from '../../../lib/pkg'
import type { UpdateState } from '../update-state'
import type { Container } from '../../../lib/di/index'

enum DepType {
  TYPE_NORMAL = 1,
  TYPE_DEPENDANT,
}

interface LegendTypes {
  [type: string]: DepType,
}

interface Legend {
  types: LegendTypes,
  getStyleItem(type: string, flags: DepType): string,
  getStyle(type: string, newReason?: string): string,
  toDot(): string,
}

function getLegend(): Legend {
  return {
    types: {},

    getStyleItem(type, flags) {
      const isDependant = flags & DepType.TYPE_DEPENDANT

      const baseStyle = (type: string) => {
        switch (type) {
          case 'root':
            return `shape=egg color=green`
          case 'new':
            return `shape=ellipse color="#11ccbb"`
          case 'outdated':
            return `shape=ellipse color=grey style=dashed`
          case 'patch':
            return `shape=box color=${isDependant ? 'green1' : 'darkgreen'}`
          case 'minor':
            return `shape=box color=${isDependant ? 'gold' : 'darkgoldenrod2'}`
          case 'major':
            return `shape=doublecircle color=${isDependant ? 'red' : 'red3'}`
          default:
            return `shape=box color=crimson`
        }
      }

      let attrs = `tooltip="release-type: ${type}"`

      if (type.startsWith('pre')) {
        attrs += ' ' + baseStyle(type.replace('pre', ''))
        attrs += ` style=filled peripheries=2`
      } else {
        attrs += ' ' + baseStyle(type)
        if (isDependant) {
          attrs += ' style=dashed'
        }
      }

      return attrs
    },

    getStyle(type, newReason = void 0) {
      const flags = newReason === 'dependant' ? DepType.TYPE_DEPENDANT : DepType.TYPE_NORMAL
      this.types[type] = this.types[type] || 0
      this.types[type] |= flags

      return this.getStyleItem(type, flags)
    },

    toDot() {
      const result: string[] = []
      for (const [type, flags] of Object.entries(this.types)) {
        result.push(`${type}[${this.getStyleItem(type, DepType.TYPE_NORMAL)}]`)
        if ((flags as DepType) & DepType.TYPE_DEPENDANT) {
          result.push(`${type}_d[${this.getStyleItem(type, DepType.TYPE_DEPENDANT)} label="only deps changed"]`)
          result.push(`${type} -> ${type}_d[style=invis]`)
        }
      }
      return result.join('\n')
    },
  }
}

function makeSafeId(name: string): string {
  return name.replace(/[-/@]/g, '___')
}

function pkgTitle(pkg: Pkg): string {
  const graphConfig = pkg.pvmConfig.update.graph
  return graphConfig.strip_namespace ? pkg.shortName : pkg.name
}

function updateStateToDot(updateState: UpdateState): string {
  const { config } = updateState.repo
  const graphConfig = config.update.graph
  const result: string[] = []
  const changedHash: Record<string, AppliedPkg> = Object.create(null)
  const legend = getLegend()

  for (const [oldPkg, newPkg] of updateState.getReleasePackages()) {
    const id = makeSafeId(newPkg.name)
    const releaseType = semver.diff(oldPkg.version, newPkg.version) || 'new'
    const nodeStyle = legend.getStyle(newPkg.isRoot ? 'root' : releaseType, updateState.updateReasonMap.get(oldPkg))
    result.push(`${id}[label="${pkgTitle(newPkg)}@${newPkg.version}" ${nodeStyle}]`)

    changedHash[id] = newPkg
  }

  for (const [id, newPkg] of Object.entries(changedHash)) {
    const newPkgDeps = newPkg.allOwnDeps

    for (const dep of Object.keys(newPkgDeps)) {
      const depMatch = newPkgDeps[dep]
      const depId = makeSafeId(dep)
      const edgeStyle = ''

      if (depId in changedHash) {
        const depPkg = changedHash[depId]
        if (semver.satisfies(depPkg.version, depMatch)) {
          result.push(`${id} -> ${depId} [${edgeStyle}]`)
        } else {
          const safeId = `${depId}_${depMatch}`
            .replace(/[-.]/g, '_')
            .replace(/[=><^*~]/g, (m) => {
              const matchStr = '=><^*~'

              return String.fromCharCode(matchStr.indexOf(m.charAt(0)) + 'A'.charCodeAt(0))
            })
          result.push(`${safeId}[label="${pkgTitle(depPkg)}@${depMatch}" ${legend.getStyle('outdated')}]`)
          result.push(`${id} -> ${safeId}`)
        }
      }
    }
  }

  return (
    `# visit http://viz-js.com/ for debugging
# and https://graphviz.gitlab.io/_pages/pdf/dotguide.pdf for docs
digraph p {
  compound=true;
  rankdir=LR;
  concentrate=true;
  center=true;
  fontname=Helvetica
  labelloc="t"
  ranksep=0.5
  node [fontname=Helvetica fontsize=20]
  edge [color=grey fontname=Helvetica]

  subgraph cluster_0 {
    label=legend color="#eeeeee" style=filled
    ${legend.toDot()}
  }

  subgraph cluster_1 {
    penwidth=0;
    label="${graphConfig.title}";

    ${result.join('\n  ')}
  }
}`
  )
}

async function run(_di: Container, updateState: UpdateState): Promise<string | void> {
  if (updateState.isSomethingForRelease) {
    return updateStateToDot(updateState)
  }
}

export {
  updateStateToDot,
  run,
}
