// создает репозиторий вместе с gitlab-like сервисом

const fs = require('fs')
const express = require('express')
const bodyParser = require('body-parser')
const { reposDir } = require('../repos-dir')

const app = express()
app.use(bodyParser.json())

app.locals.reposDir = reposDir

function sendp(res, paginated) {
  const [list, headers] = paginated
  res.set(headers)
  res.json(list)
}

app.use((req, res, next) => {
  res.sendPaginated = (paginated) => sendp(res, paginated)
  next()
})

app.use('/api/v4', require('./fixtures-and-fakes'))
app.use('/api/v4', require('./tags'))
app.use('/api/v4', require('./commits'))
app.use('/api/v4', require('./approvals'))
app.use('/api/v4', require('./version'))
app.use('/slack-hook', require('./slack-hook'))

app.use(function(err, req, res, next) {
  fs.writeFileSync('gl-api-error.log', String(err.stack), {
    flag: 'w',
  })
  console.error(err.stack)
  res.status(500).json(err.stack || err.message || err.toString() || 'Something went wrong.')
})

const start = () => {
  return new Promise((resolve, reject) => {
    // eslint-disable-next-line prefer-const
    let httpServer
    const successCb = () => {
      const serverAddress = httpServer.address()
      console.log('gitlab mock server listening on', serverAddress)
      resolve(app)
    }

    httpServer = app
      .listen(0, successCb)
      .on('error', (err) => {
        reject(err)
      })
    app.httpServer = httpServer
  })
}

const stop = () => {
  return new Promise((resolve, reject) => {
    const httpServer = app.httpServer

    if (httpServer && httpServer.listening) {
      httpServer.close(e => {
        if (e) {
          console.error(`Couldn't stop mock server!`, e.toString())
          reject(e)
        } else {
          console.log('gitlab mock server has stopped')
          resolve()
        }
      })
    } else {
      resolve()
    }
  })
}

exports.stop = stop
exports.start = start
exports.app = app

if (require.main === module) {
  start()
    .catch(e => {
      console.error(e && e.stack || e || 'unknown error!')
      process.exitCode = 1
    })
}
