import mri from 'mri'

function toUpper(str: string): string {
  return str.replace(/-[a-z]/g, m => m.charAt(1).toUpperCase())
}

export function parseSubArgsDashedCase(opts: string[] = []) {
  return mri(opts.map(opt => `--${opt}`))
}

export function parseSubArgs(args: string[] = []) {
  return mri(args.map(opt => {
    const eqIndex = opt.indexOf('=')
    const lastUpperIndex = eqIndex === -1 ? opt.length : eqIndex

    const leftPart = opt.substr(0, lastUpperIndex)
    const rightPart = opt.substr(lastUpperIndex)

    return `--${toUpper(leftPart)}${rightPart}`
  }))
}
