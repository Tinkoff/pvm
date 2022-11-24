#!/usr/bin/env node
import fs from 'fs'
import util from 'util'
import resolveFrom from 'resolve-from'
import { getConfig } from '../lib/config'
import lastTag from '../lib/git/last-tag'
import { log } from '../lib/logger'
import { requireDefault } from '../lib/interop'
import { env } from '../lib/env'

const writeFile = util.promisify(fs.writeFile)

// TODO: кажется команда уже не нужна и устарела
export const command = 'sync-tag'
export const description = `Extracts version from git tag and writes to package.json`
export const builder = {}
export const handler = main

async function updatePkgVersion(pkgDir, version) {
  const config = await getConfig()
  const pkgPath = resolveFrom(pkgDir, './package.json')
  const p = requireDefault(pkgPath)
  p.version = version
  await writeFile(pkgPath, JSON.stringify(p, null, config.packages?.indent) + '\n')
}

async function main() {
  const {
    NPM_TOKEN,
    CI_COMMIT_TAG = lastTag(),
  } = env

  if (!NPM_TOKEN) {
    throw new Error('env variable NPM_TOKEN isn\'t defined!')
  }

  const version = CI_COMMIT_TAG.substr(1)
  log(`new version is ${version}`)

  const pkgDir = process.cwd()
  log(`package directory is ${pkgDir}`)

  await updatePkgVersion(pkgDir, version)
  log(`package.json has updated`)
}
