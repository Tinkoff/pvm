import shuffleSeed from 'shuffle-seed'
import formatDate from 'date-fns/format'
import uniq from 'uniq'
import dateNow from '@pvm/core/lib/now'
import { lastReleaseTag } from '@pvm/core/lib/git/last-release-tag'
import type { Config } from '@pvm/core/lib/config'
import { log } from '@pvm/core/lib/logger'
import { wdShell } from '@pvm/core/lib/shell'
import resolveWords from './resolve-words'

function rotate<T>(arr: ReadonlyArray<T>, n: number): T[] {
  return arr.slice(n, arr.length).concat(arr.slice(0, n))
}

function randomWord(length: number): string {
  let word = ''

  while (length--) {
    word += String.fromCharCode(Math.round('a'.charCodeAt(0) + Math.random() * ('z'.charCodeAt(0) - 'a'.charCodeAt(0))))
  }

  return word
}

function takeNextSuffix(cwd: string, words: string[], prevWord: string | null, generateName: (word: string) => string): string {
  const suffixIndex = prevWord ? words.indexOf(prevWord) + 1 : 0
  // First try for new release name will be in the beginning of the new array
  const rotatedWords = rotate(words, suffixIndex)
  let rotatedIndex = 0

  let suffix
  let found = false
  while (rotatedIndex < rotatedWords.length) {
    suffix = rotatedWords[rotatedIndex++]

    try {
      wdShell(cwd, `git check-ref-format tags/${suffix}`)
      found = true
    } catch (e) {
      // continue
    }

    try {
      const maybeReleaseName = generateName(suffix)
      wdShell(cwd, `git rev-parse ${maybeReleaseName}`)

      // release tag already exists
      found = false
      log(
        `generated release name ${maybeReleaseName} already taken, switching to random word. Try increase count of available suffixes via tagging.suffixes option.`
      )
      break
    } catch (e) {
      // it's ok
    }

    if (found) {
      break
    }
  }

  if (!found) {
    // @ts-ignore
    if (global.__PVM_TEST_CASE_002_THROW_AT_RANDOM_WORD) {
      throw new Error('__PVM_TEST_CASE_002_THROW_AT_RANDOM_WORD')
    }
    log(`Couldn't get suffix from given suffixes. Generating random word..`)
    suffix = randomWord(7)
  }
  return suffix
}

function filterSuffixes(suffixes: string[] | string): string[] {
  // see https://stackoverflow.com/questions/26382234/what-names-are-valid-git-tags
  return uniq(resolveWords(suffixes)
    .map(s => s
      .replace(/[\s~^?*[:\\]+/g, '-')
      .replace(/\.+$/, '')
      .replace(/^[.-]+/, '')
      .replace(/\.\.+/g, '.')
      .replace(/@{/g, '')
      .replace(/[^a-zA-Z-._0-9@]/g, '')
    )
  )
}

export function addSuffixToSemverTagName(config: Config, seed: string, semverTag: string): string {
  const {
    suffixes,
  } = config.tagging

  const resolvedSuffixes = filterSuffixes(suffixes)

  const suffixSeparatorSymbol = '#'

  const prevReleaseTag = lastReleaseTag(config, 'HEAD')
  let prevReleaseSuffix: string | null = null
  if (prevReleaseTag) {
    prevReleaseSuffix = prevReleaseTag.split(suffixSeparatorSymbol).slice(1).join(suffixSeparatorSymbol)
  }
  log('previous release suffix:', prevReleaseSuffix)

  const shuffledWords = shuffleSeed.shuffle(resolvedSuffixes, seed)

  const generateName = (suffix: string): string => {
    return `${semverTag}${suffixSeparatorSymbol}${suffix}`
  }

  const nextSuffix = takeNextSuffix(config.cwd, shuffledWords, prevReleaseSuffix, generateName)
  return generateName(nextSuffix)
}

export function calcGenericTagName(config: Config, seed: string): string {
  const {
    prefix = 'release',
    date_format = 'yyyy.MM.dd',
    suffixes = config.tagging.suffixes || ['apple', 'banana', 'grape', 'lemon', 'orange', 'strawberry'],
  } = config.tagging.generic_tag

  if (date_format.indexOf('-') !== -1) {
    throw new Error(`'-' in date_format option is not allowed`)
  }

  const resolvedSuffixes = filterSuffixes(suffixes)

  const prevReleaseTag = lastReleaseTag(config, 'HEAD')
  let prevReleaseSuffix: string | null = null
  if (prevReleaseTag) {
    prevReleaseSuffix = prevReleaseTag.split('-').slice(2).join('-')
  }
  log('previous release suffix:', prevReleaseSuffix)

  const shuffledWords = shuffleSeed.shuffle(resolvedSuffixes, seed)

  const now = dateNow()
  const dateString = formatDate(now, date_format)

  const generateName = (suffix: string): string => {
    return `${prefix}-${dateString}-${suffix}`
  }

  const nextSuffix = takeNextSuffix(config.cwd, shuffledWords, prevReleaseSuffix, generateName)
  return generateName(nextSuffix)
}
