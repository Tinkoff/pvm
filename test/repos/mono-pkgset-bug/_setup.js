const glz = { ...require('./src/glz/package'), version: '1.1.0' }
const glz_up = { ...require('./src/glz-update/package'), version: '2.0.1' }

module.exports = async repo => {
  await repo.addPkg('src/glz', glz)
  await repo.addPkg('src/glz-update', glz_up)

  await repo.commit('change glz & glz-update')
  await repo.tag('b-v2.0.1')
  await repo.tag('a-v1.1.0')
  await repo.tag('release-1')
}
