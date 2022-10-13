# @pvm/app

Entrypoint to pvm functionality. Consumes user config and additional plugins list


## Usage examples

As node library:
```javascript
import { Pvm } from '@pvm/app'

const pvm = new Pvm({
  config: './.pvm.toml', // or config object { mark_pr: { analyze_update: true } } for example,
  plugins: [], // this is useful for providing preconfigured Pvm instances (examples here will be github usage where github plugin is required)
  cwd: '.', // from where plugins resolving will happen
  repo: '.' // by default is equal to cwd but can differ in case you want to process external repository where pvm is not installed
})

const pkgs = await pvm.pkgset('all')
```

and as cli:
```javascript
// cli.js
import { Pvm } from '@pvm/app'
import { CLI_TOKEN } from '@pvm/tokens-cli'
import PvmCliPlugin from '@pvm/plugin-cli'

const pvm = new Pvm({
  config: {}, // or config object { mark_pr: { analyze_update: true } } for example,
  plugins: [{
    plugin: PvmCliPlugin
  }], // this is useful for providing preconfigured Pvm instances (examples here will be github usage where github plugin is required)
  cwd: process.cwd(), // by default is equal `process.cwd()`. Spcify from where plugins resolving will happen
  repo: process.cwd() // by default is equal to cwd but can differ in case you want to process external repository where pvm is not installed
})

pvm.container.get(CLI_TOKEN)(process.argv) // will start [`yargs`](https://yargs.js.org/) with all extensions, provided by CLI_EXTENSION_TOKEN, appliend 
```

then you can call `cli.js` file and use provided cli api
```
> node ./cli.js --help
```