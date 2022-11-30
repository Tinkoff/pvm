import type { ReleasedProps, Message } from '../../types'

import path from 'path'
import fs from 'fs'
import { httpreq } from '../../lib/httpreq'
import { mkdirp } from '../../lib/fs'
import childProcess from 'child_process'
import { logger } from './logger'
import type { Container } from '../../lib/di'
import { CONFIG_TOKEN, HOST_API_TOKEN } from '../../tokens'

interface NotifyOpts {
  notifyScript?: string,
  strategy?: string,
}

export async function releaseMessage(di: Container, releasedProps: ReleasedProps, opts: NotifyOpts): Promise<Message> {
  const config = di.get(CONFIG_TOKEN)
  const { strategy } = opts
  const hostApi = di.get(HOST_API_TOKEN)
  const defaultScriptName = strategy === 'stale' ? 'stale' : 'release'
  let defaultScriptPath
  const notifyScriptsPath = await hostApi.notifyScriptsPath()

  defaultScriptPath = path.resolve(notifyScriptsPath, `${defaultScriptName}.js`)
  if (!fs.existsSync(defaultScriptPath)) {
    defaultScriptPath = path.resolve(defaultScriptPath, `${defaultScriptName}.js`)
  }

  const {
    notifyScript = defaultScriptPath,
  } = opts

  let localScriptPath
  let doCleanup
  if (/^https?:\/\//.test(notifyScript)) {
    logger.info(`Fetch notification script from ${notifyScript}`)
    const { body } = await httpreq(notifyScript)
    localScriptPath = path.join(config.cwd, 'node_modules', `pvm-notification-script.js`)
    logger.debug(`save fetched script to ${localScriptPath}`)
    mkdirp(path.dirname(localScriptPath))
    doCleanup = () => {
      fs.unlinkSync(localScriptPath)
    }
    fs.writeFileSync(localScriptPath, body)
  } else {
    localScriptPath = path.resolve(config.cwd, notifyScript)
    if (!fs.existsSync(localScriptPath)) {
      localScriptPath = path.resolve(notifyScriptsPath, notifyScript.endsWith('.js') ? notifyScript : `${notifyScript}.js`)
    }
  }

  if (!fs.existsSync(localScriptPath)) {
    throw new Error(`Couldn't locate ${notifyScript} from cwd or internal scripts directory`)
  }

  const p: Promise<Omit<Message, 'channel'>> = new Promise((resolve, reject) => {
    let resolved = false
    const child = childProcess.fork(localScriptPath, [], {
      stdio: 'pipe',
      execArgv: ['--unhandled-rejections=strict'],
    })
    child.on('error', reject)
    child.on('message', (msg: any) => {
      if (!resolved && msg.type === 'message') {
        resolved = true
        child.kill()
        child.unref()
        resolve(msg.message || { text: `${releasedProps.tag} has been released` })
      }
    })
    child.send(releasedProps)
    let stdout = ''
    let stderr = ''
    child.stdout!.on('data', (data) => {
      stdout += data.toString()
    })
    child.stderr!.on('data', (data) => {
      stderr += data.toString()
    })
    child.on('exit', (code) => {
      if (!resolved && code !== 0) {
        reject(new Error(`Notification script ${notifyScript} exited with code ${code}\n${stderr || ''}`))
        return
      }
      setTimeout(() => {
        if (!resolved) {
          resolved = true
          resolve({ content: stdout })
        }
      }, 0)
    })
  })

  p.finally(() => {
    if (doCleanup) {
      doCleanup()
    }
  })

  return p
}
