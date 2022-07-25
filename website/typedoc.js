module.exports = {
  tsconfig: '../tsconfig.json',
  entryPoints: '../',
  entryPointStrategy: 'expand',
  exclude: ['typedoc/**/*', '**/*+(index|.spec|.e2e).(ts|js)', '**/node_modules/**/*', '**/test/**/*', '**/type-overrides/**/*'],
  externalModuleMap: (moduleName) => {
    const [,, pkgDirName] = /(packages)[\\/](.+?)[\\/]/.exec(moduleName) ?? []

    if (!pkgDirName) {
      return
    }

    return `@pvm/${pkgDirName.replace('pvm-', '')}`
  },
  excludeExternals: true,
  inlineReferences: true,
  'sourcefile-url-prefix': `${process.env.GITHUB_SERVER_URL}/${process.env.GITHUB_REPOSITORY}/tree/master/`,
  plugin: [
    '@mshipov/typedoc-plugin-monorepo',
    'nlfurniss-typedoc-plugin-sourcefile-url',
  ],
}
