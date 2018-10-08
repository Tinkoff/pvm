#!/usr/bin/env node
// ## Install recommended vscode settings

// In case the local ones are not created by the user.

const fs = require('fs')
const path = require('path')
const chalk = require('chalk')
const { existsSync } = require('fs')

function mkdirp(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, {
      recursive: true,
    })
  }
}

function cp(fin, fout) {
  const inData = fs.readFileSync(fin)
  mkdirp(path.dirname(fout))
  fs.writeFileSync(fout, inData)
  console.log(chalk`$ {greenBright cp} ${fin} ${fout}`)
}

async function main() {
  console.log(chalk`{blueBright PVM postinstall: installing recommended vscode settings}`)
  if (existsSync('.vscode/settings.recommended.json')) {
    if (!existsSync('.vscode/settings.json')) {
      cp('.vscode/settings.recommended.json', '.vscode/settings.json')
    } else {
      console.log(chalk`{italic .vscode/settings.json} already installed! Consider installing the recommended settings for pvm from {italic .vscode/settings.recommended.json}`)
    }
  }
}

main().catch(e => {
  console.error(e)
  process.exit(1)
})
