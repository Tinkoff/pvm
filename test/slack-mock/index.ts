import type { Request, Response } from 'express'
import express from 'express'

const MESSENGER_MOCK_PORT_BASE = 4356
const occupiedPorts: number[] = []

function findFreePort() {
  let port: number = MESSENGER_MOCK_PORT_BASE
  // eslint-disable-next-line no-empty
  while (occupiedPorts.indexOf(port) !== -1) {
    port++
  }
  return port
}

export type SlackMock = {
  mockerUrl: string,
  spy(spyHandler: (req: Request, res: Response) => void): (() => void),
  stop(): Promise<void>,
  clear: () => void,
}

export async function runMessengerMocker() {
  return new Promise<SlackMock>((resolve, reject) => {
    let spies: Array<(req: Request, res: Response) => void> = []
    const port = findFreePort()

    occupiedPorts.push(port)

    const server = express()
      .use(express.json())
      .post('*', (req, res) => {
        spies.forEach(s => s(req, res))
        res.send()
      })
      .listen(port)
      .on('listening', () => {
        console.log('messenger mock server listening on', port)
        resolve({
          mockerUrl: `http://localhost:${port}`,
          spy(spyHandler: (req: Request, res: Response) => void) {
            spies.push(spyHandler)
            return () => {
              spies.splice(spies.indexOf(spyHandler), 1)
            }
          },
          stop: () => {
            return new Promise<void>((resolve, reject) => {
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
      .on('error', (err: any) => {
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
