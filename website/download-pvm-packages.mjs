import fs from "fs";
import path from "path";
import { pkgset } from "@pvm/pkgset";
import drainItems from "@pvm/core/lib/iter/drain-items.js";
import {fileURLToPath} from 'url';

const __filename = fileURLToPath(import.meta.url);

const pvmPackages = (await drainItems.default(pkgset('all', {
  cwd: path.join(path.dirname(__filename), '..')
}))).filter(pkg => !pkg.meta.private).map(pkg => ({
  name: pkg.name,
  version: pkg.version,
}))

console.log('@pvm/* packages', JSON.stringify(pvmPackages, null, 2))

const artifactsPath = 'build/artifacts'
if (!fs.existsSync(artifactsPath)) {
  fs.mkdirSync(artifactsPath)
}
fs.writeFileSync(path.join(artifactsPath, 'packages.json'), JSON.stringify(pvmPackages))
