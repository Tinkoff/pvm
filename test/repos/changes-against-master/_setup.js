
module.exports = async (repo) => {
  await repo.runScript('git checkout -b pr')
  await repo.writeFile('pkgs/magnolia/a', 'Science is organized knowledge.', `I'm changing magnolia`)
  await repo.writeFile('pkgs/rosetta/r', 'Wisdom is organized life.', `I'm changing rosetta`)
  await repo.touch('pkgs/roset', `I'm changing root pkg`)
}
