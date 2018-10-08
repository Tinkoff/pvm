import getStdin from 'get-stdin'

import { formatText } from '../../lib/messaging'

// eslint-disable-next-line node/no-extraneous-import
import type { Argv } from 'yargs'

export const command = 'format'
export const description = 'Formats text for slack, for example convert markdown links to slack links and optionally convert dashes to dots'
export const builder = (yargs: Argv) => {
  return yargs
    .example(`cat release-notes.md | $0 slack format`, 'format release-notes.md contents for slack')
    .option('dottify', {
      desc: 'converts given list symbol to •. If value is ommited "-" value is using.',
      default: false,
      type: 'boolean' as const,
    })
}
export const handler = main

async function format(flags) {
  const stdin = await getStdin()
  return formatText(stdin, flags)
}

async function main(argv) {
  const result = await format(argv)
  process.stdout.write(result)
}
