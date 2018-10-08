import fs from 'fs'
import getStdin from 'get-stdin'
import getEnv from '../lib/env'
import requireSetupScript from '../lib/require-setup-script'

// eslint-disable-next-line node/no-extraneous-import
import type { Argv } from 'yargs'

export const command = 'template'
export const description = 'Templating and formatting messages utility'
export const builder = (yargs: Argv) => {
  return yargs
    .example(`echo "Hello {{ name }}" | pvm template -t=- -c <(echo '{"name": "Bob"}')`, `renders template`)
    .option('template', {
      alias: 't',
      desc: `template id for rendering. Define template in .pvm.d/templates/ or in templates config section. Use - for reading template from stdin.`,
    })
    .option('context', {
      alias: 'c',
      desc: `Filepath to context for template in JSON format. Use - for reading context from stdin.`,
    })
    .option('setup-script', {
      alias: 's',
      desc: 'Additional script for extending template environment',
    })
}
export const handler = main

async function run(flags) {
  let template = flags.template
  let templateAsName = true
  if (template === '-') {
    template = await getStdin()
    templateAsName = false
  }

  const contextString = flags.context === '-' ? await getStdin() : fs.readFileSync(flags.context)

  const context = contextString ? JSON.parse(contextString.toString()) : {}
  const env = await getEnv()
  if (flags.setupScript) {
    const setupFn = requireSetupScript(flags.setupScript)

    await setupFn(env)
  }

  let result
  if (templateAsName) {
    result = env.render(template, context)
  } else {
    result = env.renderString(template, context)
  }
  return result
}

async function main(argv) {
  const result = await run(argv)
  process.stdout.write(result)
}
