
interface ReadLinesOptions {
  splitter?: string,
}

async function * readLines(opts: ReadLinesOptions = {}) {
  const { splitter = '\n' } = opts

  process.stdin.resume()
  process.stdin.setEncoding('utf8')

  let lingeringLine = ''

  let lines: string[] = []
  let resolver

  process.stdin.on('data', function(chunk) {
    lines = (chunk as unknown as string).split(splitter)

    lines[0] = lingeringLine + lines[0]
    lingeringLine = lines.pop() || ''

    resolver()
  })

  process.stdin.on('end', function() {
    lines = []
    if (lingeringLine) {
      lines = [lingeringLine]
    }
    resolver(true)
  })

  while (true) {
    const p = new Promise(resolve => {
      resolver = resolve
    })
    const needStop = await p
    yield * lines
    if (needStop) {
      break
    }
  }
}

export default readLines

async function main() {
  for await (const line of readLines()) {
    console.log(':', line)
  }
}

if (require.main === module) {
  main()
    .catch(e => {
      console.error(e)
      process.exitCode = 1
    })
}
