const path = require('path')
const fs = require('fs-extra')
const { spawn } = require('child_process')
const getPort = require('get-port')

async function runRegistryMockServer() {
  const npmRegistryMockPath = path.join(require('../mock-dir').mockDir, 'npm')

  if (fs.existsSync(npmRegistryMockPath)) {
    fs.removeSync(npmRegistryMockPath)
  }

  const dbDirectory = path.join(npmRegistryMockPath, 'db')
  fs.mkdirpSync(dbDirectory)

  const preparedConfigPath = path.join(npmRegistryMockPath, 'verdaccio.yml')
  const preparedConfig = fs.readFileSync(path.join(__dirname, 'verdaccio.config.yaml'), 'utf-8')
    .replace('$[STORAGE_PATH]', dbDirectory)
  fs.outputFileSync(preparedConfigPath, preparedConfig, 'utf-8')
  let killTimeout
  const freePort = await getPort()

  return new Promise(function(resolve, reject) {
    const registryProc = spawn(`node`, [`node_modules/verdaccio/bin/verdaccio`, `--config`, preparedConfigPath, `--listen`, freePort ], {
      stdio: ['pipe', 'pipe', 'inherit'],
    })

    registryProc.stdout.on('data', (data) => {
      const logLine = data.toString()
      process.stdout.write(logLine)
      // https://verdaccio.org/docs/e2e/#example-using-bash
      if (logLine.indexOf('http address') !== -1) {
        clearTimeout(killTimeout)
        resolve({
          stop: registryProc.kill.bind(registryProc),
          clear: () => fs.removeSync(dbDirectory) && fs.mkdirpSync(dbDirectory),
          registryUrl: /(http:\/\/.*?\/)/.exec(logLine)[1],
        })
      }
    })

    registryProc.on('close', (code) => {
      clearTimeout(killTimeout)
      console.log(`Verdaccio exit with code ${code}`)
    })

    killTimeout = setTimeout(() => {
      registryProc.kill(1)
      reject(new Error('Registry up timeout'))
    }, 5000)
  })
}

module.exports.runRegistryMockServer = runRegistryMockServer
