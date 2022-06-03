const cp = require('child_process')
const fs = require('fs')
const path = require('path')
const fetch = require('node-fetch')

const pvmPackages = JSON.parse(cp.execSync('npm search @pvm/ --json', {
  encoding: 'utf-8',
})).map(pkg => ({
  name: pkg.name,
  version: pkg.version,
  tgz: `${pkg.name.split('/')[1]}-${pkg.version}.tgz`,
}))

console.log('Global @pvm/* packages', JSON.stringify(pvmPackages, null, 2))

const artifactsPath = 'build/artifacts'
if (!fs.existsSync(artifactsPath)) {
  fs.mkdirSync(artifactsPath)
}
fs.writeFileSync(path.join(artifactsPath, 'packages.json'), JSON.stringify(pvmPackages))
pvmPackages.forEach(async ({ name, tgz }) => {
  const pkgTarPath = path.join(artifactsPath, tgz)
  const pkgTarUrl = `https://registry.npmjs.org/${name}/-/${tgz}`

  console.log(`Downloading ${pkgTarUrl} to ${pkgTarPath}`)
  const pkgData = await (await fetch(pkgTarUrl)).arrayBuffer()

  fs.writeFileSync(pkgTarPath, Buffer.from(pkgData))
})
