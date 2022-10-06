const { existsSync } = require('fs')
const path = require('path')

module.exports = {
  tsconfig: '../tsconfig.json',
  entryPoints: '../',
  entryPointStrategy: 'expand',
  exclude: ['typedoc/**/*', '**/*+(index|.spec|.e2e).(ts|js)', '**/node_modules/**/*', '**/test/**/*', '**/type-overrides/**/*'],
  externalModuleMap: (moduleName) => {
    let pkgjsonPath
    let dir = path.dirname(moduleName)
    const rootParentDir = path.resolve('..', '..')
    while (dir !== rootParentDir) {
      const p = path.join(dir, 'package.json')
      if (existsSync(path.join(dir, 'package.json'))) {
        pkgjsonPath = p
        break
      }
      dir = path.dirname(dir)
    }

    if (!pkgjsonPath) {
      return
    }

    return require(pkgjsonPath).name
  },
  excludeExternals: true,
  inlineReferences: true,
  'sourcefile-url-prefix': `${process.env.GITHUB_SERVER_URL}/${process.env.GITHUB_REPOSITORY}/tree/master/`,
  plugin: [
    '@mshipov/typedoc-plugin-monorepo',
    'nlfurniss-typedoc-plugin-sourcefile-url',
  ],
}
