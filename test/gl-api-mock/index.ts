// создает репозиторий вместе с gitlab-like сервисом

import fs from 'fs'
import type { Response } from 'express'
import express from 'express'
import bodyParser from 'body-parser'
import { reposDir } from '../repos-dir'

import fixtures_and_fakes from './fixtures-and-fakes'
import tags from './tags'
import commits from './commits'
import approvals from './approvals'
import version from './version'
import slack_hook from './slack-hook'

const app = express()
app.use(bodyParser.json())

app.locals.reposDir = reposDir

function sendp(res: Response, paginated: [any[], Record<string, string>]) {
  const [list, headers] = paginated
  res.set(headers)
  res.json(list)
}

app.use((_req, res, next) => {
  res.app.locals.sendPaginated = (paginated: [any[], Record<string, string>]) => sendp(res, paginated)
  next()
})

app.use('/api/v4', fixtures_and_fakes)
app.use('/api/v4', tags)
app.use('/api/v4', commits)
app.use('/api/v4', approvals)
app.use('/api/v4', version)
app.use('/slack-hook', slack_hook)

// @ts-ignore
app.use(function(err: any, _req, res, _next) {
  fs.writeFileSync('gl-api-error.log', String(err.stack), {
    flag: 'w',
  })
  console.error(err.stack)
  res.status(500).json(err.stack || err.message || err.toString() || 'Something went wrong.')
})

const start = () => {
  return new Promise((resolve, reject) => {
    // eslint-disable-next-line prefer-const
    let httpServer: any
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
    // @ts-ignore
    app.httpServer = httpServer
  })
}

const stop = () => {
  return new Promise<void>((resolve, reject) => {
    // @ts-ignore
    const httpServer = app.httpServer

    if (httpServer && httpServer.listening) {
      httpServer.close((e: any) => {
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
