
module.exports = async (repo) => {
  await repo.writeFile('a.txt', 'hello', 'init a')
  await repo.tag('v1.0.0', 'initial release')
  await repo.writeFile('a.txt', 'hello world', 'Hello World')
  await repo.writeFile('a.txt', 'hello world!', 'Exclamation!')
  await repo.tag('v1.1.0', '- Hello world\n- And exclamation')
}
