module.exports = function(fileInfo, api, options) {
  const depth = fileInfo.path.split('\\').length - 3

  const re = /@pvm\/(types)/
  return api.jscodeshift(fileInfo.source)
    .find(api.jscodeshift.ImportDeclaration)
    .forEach(path => {
      const source = path.value.source
      const [f, m] = re.exec(source.value) ?? []

      if (f) {
        const replace = Array(depth).fill('..').join('/') + `/${m}`
        source.value = source.value.replace(f, replace)
      }
    })
    .toSource()
}
