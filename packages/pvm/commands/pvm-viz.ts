/* eslint-disable no-console */
import fs from 'fs'
import { renderDot } from '../lib/viz'

// eslint-disable-next-line node/no-extraneous-import
import type { Argv } from 'yargs'

export default () => ({
  command: 'viz <files..>',
  description: 'Graphviz pvm cli wrapper',
  builder: (yargs: Argv) => {
    return yargs
      .example(`$0 viz graph.dot`, 'Render dot file to stdout')
  },
  handler: async function main(argv) {
    argv.files.forEach(file => {
      const str = fs.readFileSync(file, 'utf-8')
      renderDot(str)
        .then(result => {
          console.log(result)
        })
        .catch(err => {
          process.exitCode = 1
          console.error(err)
        })
    })
  },
})
