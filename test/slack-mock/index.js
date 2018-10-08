const express = require('express')

const MESSENGER_MOCK_PORT_BASE = 4356
const occupiedPorts = []

function findFreePort() {
  let port = MESSENGER_MOCK_PORT_BASE
  // eslint-disable-next-line no-empty
  while (occupiedPorts.indexOf(port) !== -1) {
    port++
  }
  return port
}

module.exports.runMessengerMocker = async function runMessengerMocker() {
  return new Promise((resolve, reject) => {
    let spies = []
    const port = findFreePort()

    occupiedPorts.push(port)

    const server = express()
      .use(express.json())
      .post('*', (req, res) => {
        spies.forEach(s => s(req))
        res.send()
      })
      .listen(port)
      .on('listening', () => {
        console.log('messenger mock server listening on', port)
        resolve({
          mockerUrl: `http://localhost:${port}`,
          spy(spyHandler) {
            spies.push(spyHandler)
            return () => {
              spies.splice(spies.indexOf(spyHandler), 1)
            }
          },
          stop: () => {
            return new Promise((resolve, reject) => {
              server.close((err) => {
                if (err) {
                  reject(err)
                  return
                }

                resolve()
              })
            })
          },
          clear: () => {
            spies = []
          },
        })
      })
      .on('error', (err) => {
        if (err.code === 'EADDRINUSE') {
          runMessengerMocker()
            .then(resolve, reject)
        } else {
          server.close()
          reject(err)
        }
      })
      .on('close', () => {
        occupiedPorts.splice(occupiedPorts.indexOf(port), 1)
      })
  })
}
