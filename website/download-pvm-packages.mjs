import fs from "fs-extra";
import path from "path";
import fetch from "node-fetch";
import {fileURLToPath} from 'url';
import { Pvm } from '@pvm/pvm'

const __filename = fileURLToPath(import.meta.url);

const pvm = new Pvm({
  cwd: path.join(path.dirname(__filename), '..')
})
const pvmPackages = (await pvm.getPackages('all')).filter(pkg => !pkg.meta.private).map(pkg => ({
  name: pkg.name,
  version: pkg.version,
  tgz: `${pkg.shortName}-${pkg.version}.tgz`,
}))

console.log('@pvm/* packages', JSON.stringify(pvmPackages, null, 2))

const artifactsPath = 'build/artifacts'

fs.outputFileSync(path.join(artifactsPath, 'packages.json'), JSON.stringify(pvmPackages))
pvmPackages.forEach(async ({ name, tgz }) => {
  const pkgTarPath = path.join(artifactsPath, tgz)
  const pkgTarUrl = `https://registry.npmjs.org/${name}/-/${tgz}`

  console.log(`Downloading ${pkgTarUrl} to ${pkgTarPath}`)
  const pkgData = await (await fetch(pkgTarUrl)).arrayBuffer()

  fs.writeFileSync(pkgTarPath, Buffer.from(pkgData))
})
