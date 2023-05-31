
function padLines(str: string, count = 1): string {
  const sp = Buffer.alloc(count, ' ').toString()
  return str.split(/\n/g).map(line => sp + line).join('\n')
}

export default padLines
