#!/usr/bin/env node

import getStdin from 'get-stdin'

export const command = 'tojson'
export const description = 'convert text to json'
export const builder = (yargs) => {
  return yargs
    .example('echo -e "a\\nb" | $0 tojson -t array', `convert lines to json array, ["a", "b"]`)
    .example('echo hello world | $0 tojson -k foo', `wrap string to json object, {"foo": "hello world"}`)
    .example('echo -e "a\\nb" | $0 tojson -t array -k foo', `convert lines to array and wrap to json object, {"foo": ["a", "b"]}`)
    .option('type', {
      alias: 't',
      desc: `type for input, could be string or array`,
    })
    .option('key', {
      alias: 'k',
      desc: 'key for wrapping to object',
    })
}

export const handler = main

async function run(flags) {
  let result: any = await getStdin()
  if (flags.type === 'array') {
    result = result.split(/\n/)
    if (result.length && result[result.length - 1] === '') {
      result.pop()
    }
  }
  if (flags.key) {
    result = {
      [flags.key]: result,
    }
  }
  return result
}

async function main(argv) {
  const result = await run(argv)
  console.log(JSON.stringify(result))
}
