module.exports = async (pluginsApi) => {
  pluginsApi.provides('git.push_remote', async () => {
    console.log('git.push_remote executed')
    return 'remote'
  })

  await Promise.resolve()
  console.log(`local plugin loaded sucessfully. Branch: ${require('child_process').execSync('git rev-parse --abbrev-ref HEAD', { cwd: pluginsApi.cwd })}`)
}
