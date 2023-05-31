const headingLineRe = /^\s*(#+)/
const firstHeadingLineRe = /^-?\s*(#+)/

function indentHeadings(body: string, tagHeadLevel = 2): string {
  let bodyMinHeadingLevel = Infinity

  const lines = body.split(/\r?\n/g)

  lines.forEach((line, i) => {
    const m = line.match(i === 0 ? firstHeadingLineRe : headingLineRe)
    if (m) {
      const lineLevel = m[1].length
      if (lineLevel < bodyMinHeadingLevel) {
        bodyMinHeadingLevel = lineLevel
      }
    }
  })

  const diff = tagHeadLevel - bodyMinHeadingLevel + 1

  if (diff <= 0) {
    return lines.join('\n')
  }

  const toAppend = Buffer.alloc(diff, '#')

  return lines.map((line, i) => {
    const headRe = i === 0 ? firstHeadingLineRe : headingLineRe

    const m = line.match(headRe)
    if (m) {
      return line.replace(headRe, (a) => {
        return a + toAppend
      })
    }
    return line
  }).join('\n')
}

export default indentHeadings
