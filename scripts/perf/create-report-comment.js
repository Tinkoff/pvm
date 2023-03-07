const { Pvm, PLATFORM_TOKEN } = require('@pvm/pvm')
const fs = require('fs')

async function main() {
  const pvmApp = new Pvm()
  const githubPlatform = pvmApp.container.get(PLATFORM_TOKEN)

  await githubPlatform.beginMrAttribution()
  await githubPlatform.syncText('performance-report', fs.readFileSync('public/metrics-table.html', 'utf-8'))
}

main().catch(e => {
  process.exitCode = 1
  console.error(e)
})
