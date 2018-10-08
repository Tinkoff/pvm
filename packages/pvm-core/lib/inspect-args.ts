import util from 'util'

export function inspectArgs(args: any[], maxSizePerArg = 165): string {
  return args.map(arg => {
    const inspected = util.inspect(arg)
    return inspected.length < maxSizePerArg ? inspected : inspected.slice(0, maxSizePerArg) + `..<cut>'`
  }).join(', ')
}
