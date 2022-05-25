const cliInline = require('@pvm/cli-inline-remark-plugin')
const glob = require('glob')
const fs = require('fs')

async function run() {
  const { unified } = await import('unified')
  const remarkParse = (await import('remark-parse')).default
  const remarkStringify = (await import('remark-stringify')).default
  const processor = await unified()
    .use(remarkParse)
    .use(remarkStringify)
    .use(cliInline)

  const readmes = glob.sync('@(packages|tools)/*/README.md')

  for (const f of readmes) {
    const remarked = await processor.process(fs.readFileSync(f, 'utf-8'))
    fs.writeFileSync(f, String(remarked))
  }
}

run()
  .catch((e) => {
    console.error(e)
    process.exitCode = 1
  })
