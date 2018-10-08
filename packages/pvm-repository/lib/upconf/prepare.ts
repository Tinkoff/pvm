import fs from 'fs'
import path from 'path'
import { createPatch } from 'rfc6902'

import { loggerFor } from '@pvm/core/lib/logger'
import { loadRawConfig } from '@pvm/core/lib/config'

import type { UpconfData } from '@pvm/core/lib/config/types'

const logger = loggerFor('pvm:upconf')

async function prepare(cwd: string) {
  logger.info('Saving patch of new config to pvm-upconf.json ..')
  const initialConfig = loadRawConfig(cwd, 'HEAD').config
  const currentConfig = loadRawConfig(cwd).config
  logger.debug('INITIAL CONFIG')
  logger.debug(JSON.stringify(initialConfig, null, 2))
  logger.debug('CURRENT CONFIG')
  logger.debug(JSON.stringify(currentConfig, null, 2))

  const configPatch = createPatch(currentConfig, initialConfig)
  if (configPatch.length === 0) {
    throw new Error(`You must run the prepare command after modifying the config but before committing changes`)
  }

  const upconfData: UpconfData = {
    config_patch: configPatch,
  }

  fs.writeFileSync(path.join(cwd, 'pvm-upconf.json'), JSON.stringify(upconfData))

  logger.info('File pvm-upconf.json successfully generated.')
  logger.info('Now you can commit pvm-upconf.json along with your pvm configuration changes.')
}

export {
  prepare,
}
