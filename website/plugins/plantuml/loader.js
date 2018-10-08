const fs = require('fs-extra')
const path = require('path')
const { execSync, spawnSync } = require('child_process')
const { optimize } = require('svgo')

const plantumlJARPath = path.join(__dirname, '..', '..', '.docusaurus', 'plantuml.jar')

module.exports = function plantumlLoader(source) {
  const { plantumlVersion } = this.getOptions()
  if (this.cacheable) {
    this.cacheable()
  }

  if (!fs.pathExistsSync(plantumlJARPath)) {
    execSync(`curl -L -o "${plantumlJARPath}" https://github.com/plantuml/plantuml/releases/download/v${plantumlVersion}/plantuml-${plantumlVersion}.jar`)
  }

  const commandArgs = ['java', ['-Dfile.encoding=UTF-8', '-jar', plantumlJARPath, '-svg', '-pipe']]
  const { stdout } = spawnSync(...commandArgs, { input: source, stdio: ['pipe', 'pipe', 'inherit'] })

  const svgStr = optimize(stdout.toString('utf-8'), {
    path: this.resourcePath,
  }).data

  return `module.exports = "data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgStr)}"`
}
