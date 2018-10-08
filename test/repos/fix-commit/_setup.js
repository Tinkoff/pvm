
module.exports = async (repo) => {
  await repo.writeFile('a.txt', 'hello', 'init a')
  await repo.tag('v1.0.0', 'initial release')
  await repo.writeFile('a.txt', 'hello2', 'fix: minor version')
}
