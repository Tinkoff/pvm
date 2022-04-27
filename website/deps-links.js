const pkgName = process.argv.slice(2)

const deps = Object.keys(require(`${pkgName}/package.json`).dependencies)

const depsLinks = deps
  .filter(n => /^@pvm/.test(n))
  .map(n => {
    const path = `/docs/api/modules/${n.replace('@', '').replace(/[/-]/g, '_')}`
    return `* [${n}](${path})`
  }).join('\n')

process.stdout.write(depsLinks, 'utf-8')
