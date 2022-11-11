const got = require('got')
const fs = require('fs-extra')
const path = require('path')
const Handlebars = require('handlebars')
const initRepo = require('../../test/initRepo')
const { writeRepo } = require('../../test/writeRepo')
const { start, stop } = require('../../test/gl-api-mock')
const yargs = require('yargs')

const args = yargs
  .option('historyLength', {
    type: 'number',
    description: 'How much history to include in result',
    default: -1,
  })
  .argv

const TEST_COMMANDS = [
  'pkgset -s all',
  'pkgset -s affected',
  'update --dry-run',
  'publish --dry-run',
]
const COMMITS_COUNT = 10
const RELEASES_COUNT = 3
const PACKAGES_COUNT = 200
const RUNS_COUNT = 4

async function collectPerfMetrics(gitlabApp) {
  const versions = Array(PACKAGES_COUNT).fill(0).map((v, i) => `src/a${i}@0.0.0-stub`)
  const repo = await initRepo(writeRepo({
    name: 'manyPackagesPerf',
    private: true,
    spec: versions.join(','),
  }), {
    versioning: {
      source: 'tag',
    },
  })

  const releasesStep = Math.floor(COMMITS_COUNT / RELEASES_COUNT)
  for (let i = 0; i < COMMITS_COUNT; i++) {
    await repo.runScript(`echo "content ${i}" > src/a1/trigger.txt`)
    await repo.runScript(`git add src/a1/trigger.txt`)
    await repo.runScript(`git commit -a -m "Commit ${i}"`)
    if (i % releasesStep === 0) {
      await repo.annotatedTag(`release-${i}`, `---
${versions.map(p => p.split('/')[1]).join('\n')}`)
    }
  }

  const result = {
    releaseLink: `<a href="${process.env.GITHUB_SERVER_URL}/${process.env.GITHUB_REPOSITORY}/releases/tag/${process.env.GITHUB_REF_NAME}">${process.env.GITHUB_REF_NAME}</a>`,
    timestamp: new Date().toUTCString(),
    packagesCount: PACKAGES_COUNT,
    releasesCount: RELEASES_COUNT,
    commitsCount: COMMITS_COUNT,
    commands: {},
  }
  for (const cmd of TEST_COMMANDS) {
    const runs = []
    for (let i = 0; i < RUNS_COUNT; i++) {
      const time = process.hrtime.bigint()
      await repo.execScript(`pvm ${cmd}`, {
        env: {
          ...process.env,
          PVM_CONFIG_JIRA__URL: 'https://jira.example.com',
          PVM_TEST_DATE_NOW: '2018-11-27T12:00:00.000Z',
          CI_PROJECT_NAMESPACE: 'pfp',
          CI_PROJECT_NAME: 'test-p',
          CI_PROJECT_ID: 111,
          GL_TOKEN: '___gl___',
          PVM_TESTING_ENV: process.env.PVM_TESTING_ENV ?? 'true',
          NPM_TOKEN: '123',
          PVM_CONFIG_PLUGINS_V2: JSON.stringify([{ plugin: require.resolve('@pvm/gitlab/plugin') }]),
          PVM_CONFIG_GITLAB__URL: `http://localhost:${gitlabApp.httpServer.address().port}`,
        },
      })
      const timeEnd = process.hrtime.bigint()
      runs.push(Number(Number(timeEnd - time) / 1e9))
    }

    result.commands[cmd] = (runs.reduce((s, r) => s + r, 0) / RUNS_COUNT).toFixed(3)
  }

  return result
}

async function main() {
  let currentMetrics
  const gitlabApp = await start()

  try {
    currentMetrics = await collectPerfMetrics(gitlabApp)
  } finally {
    await stop()
  }

  let metrics = JSON.parse((await got.get('https://tinkoff.github.io/pvm/metrics.json')).body ?? '[]')
  if (args.historyLength !== -1) {
    metrics = metrics.slice(0, args.historyLength)
  }
  metrics.unshift(currentMetrics)
  fs.outputFileSync('public/metrics.json', JSON.stringify(metrics), 'utf-8')

  const tableTempl = fs.readFileSync(path.join(__dirname, 'table.hbs'), 'utf-8')
  Handlebars.registerPartial('table', tableTempl)
  const table = Handlebars.compile(tableTempl)
  const report = Handlebars.compile(fs.readFileSync(path.join(__dirname, 'report.hbs'), 'utf-8'))
  fs.outputFileSync('public/metrics.html', report(metrics), 'utf-8')
  fs.outputFileSync('public/metrics-table.html', table(metrics), 'utf-8')
  console.log(`\nResult metrics:\n\n${JSON.stringify(metrics, null, 2)}`)
}

main().catch(e => {
  process.exitCode = 1
  console.log(e)
})
