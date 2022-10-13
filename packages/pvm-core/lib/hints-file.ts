import fs from 'fs'
import path from 'path'
import * as TOML from '@iarna/toml'
import { isValidReleaseType } from './semver-extra'
import { wdShell } from './shell'

import type { UpdateHints } from '@pvm/types'
import type { Config } from './config'
import { cwdToGitRelativity } from './git/worktree'

function err(path, message): Error {
  return new Error(`[hints-file]: ${path ? `(${path})` : ''} ${message}`)
}

export interface Validator {
  run(config: Config, hints: Record<string, any>): void,
  key: string,
}

function makeValidator(key, fn): Validator {
  const api = {
    err(message) {
      return err(key, message)
    },
    key,
  }

  return {
    run: (config, hints) => {
      fn(config, hints, api, hints[key])
    },
    key,
  }
}

const validateReleaseType = makeValidator('release-type', (_config, hints, api) => {
  const releaseType = hints['release-type']
  if (releaseType) {
    if (hints['release-types']) {
      throw api.err(`release-type and release-types keys are mutually exclusive`)
    }
    if (!isValidReleaseType(releaseType)) {
      throw api.err(`release type ${releaseType} is invalid`)
    }
    hints['release-types'] = {
      [releaseType]: ['*'],
    }
  }
})

const validateReleaseTypes = makeValidator('release-types', (_, hints, api) => {
  if (!hints['release-types']) {
    return
  }
  for (const key of Object.keys(hints['release-types'])) {
    if (!isValidReleaseType(key)) {
      throw api.err(`release type '${key}' is not valid release type`)
    }
  }
})

const validateUpdateDependants = makeValidator('update-dependants-for', (config, hints, api) => {
  const {
    dependants_release_type,
    update_dependants,
  } = config.update

  if (!hints['update-dependants-for']) {
    if (update_dependants === true) {
      hints['update-dependants-for'] = [
        {
          'match': '*',
          'release-type': dependants_release_type,
        },
      ]
    } else if (Array.isArray(update_dependants)) {
      hints['update-dependants-for'] = update_dependants.map(({ match, release_type }) => {
        return {
          match,
          'release-type': release_type ?? dependants_release_type,
        }
      })
    }
    return true
  }

  if (!Array.isArray(hints['update-dependants-for'])) {
    throw err(
      '',
      'update-dependants-for should be array'
    )
  }

  if (typeof hints['update-dependants-for'][0] === 'string') {
    hints['update-dependants-for'] = hints['update-dependants-for'].map(match => {
      if (typeof match !== 'string') {
        throw err('', 'update-dependants-for should be list of strings or list of objects')
      }
      return {
        match,
        'release-type': dependants_release_type,
      }
    })
    return true
  }

  for (const upEntry of hints['update-dependants-for']) {
    if (!upEntry['release-type']) {
      upEntry['release-type'] = dependants_release_type
    }
    const releaseType = upEntry['release-type']
    if (!isValidReleaseType(releaseType) && releaseType !== 'as-dep') {
      throw api.err(
        `release type '${releaseType}' is not valid release type. Choose any valid release type or "as-dep" value.`)
    }
  }
})

const validateForceRelease = makeValidator('force-release', () => {
  // todo: implement
})

const validators: Validator[] = [
  validateReleaseType,
  validateReleaseTypes,
  validateUpdateDependants,
  validateForceRelease,
]

type HintsTuple = [UpdateHints, boolean]

function readFileByRef(cwd: string, filePath: string, ref?: string): string | null {
  if (ref) {
    try {
      return wdShell(cwd, `git show ${ref}:${cwdToGitRelativity(cwd, filePath)}`)
    } catch (e) {
      return null
    }
  } else {
    const absPath = path.join(cwd, filePath)
    if (fs.existsSync(absPath)) {
      return fs.readFileSync(absPath).toString('utf-8')
    }
  }
  return null
}

export function validateUpdateHints(config: Config, hints: Record<string, any>): void {
  const knownKeys = Object.create(null)

  for (const validator of validators) {
    knownKeys[validator.key] = 1
    validator.run(config, hints)
  }

  for (const hintsKey of Object.keys(hints)) {
    if (!(hintsKey in knownKeys)) {
      throw err('', `Unknown entry ${hintsKey}`)
    }
  }
}

async function load(config: Config, hintsFile: string, ref?: string): Promise<HintsTuple> {
  let result = {}
  let itsActuallyRead = false

  if (hintsFile) {
    const contents = readFileByRef(config.cwd, hintsFile, ref)
    if (contents) {
      itsActuallyRead = true
      result = TOML.parse(contents)
    }
  }

  validateUpdateHints(config, result)

  return [result, itsActuallyRead]
}

export default load
