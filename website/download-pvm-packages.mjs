import fs from "fs";
import path from "path";
import fetch from "node-fetch";
import { pkgset } from "@pvm/pkgset";
import drainItems from "@pvm/core/lib/iter/drain-items.js";
import {fileURLToPath} from 'url';

const __filename = fileURLToPath(import.meta.url);

const pvmPackages = (await drainItems.default(pkgset('all', {
  cwd: path.join(path.dirname(__filename), '..')
}))).map(pkg => ({
  name: pkg.name,
  version: pkg.version,
  tgz: `${pkg.shortName}-${pkg.version}.tgz`,
}))

console.log('@pvm/* packages', JSON.stringify(pvmPackages, null, 2))

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
