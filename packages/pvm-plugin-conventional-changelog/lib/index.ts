import path from 'path'
import conventionalCommitsFilter from 'conventional-commits-filter'
import conventionalChangelogPresetLoader from 'conventional-changelog-preset-loader'
import conventionalChangelogWriter from 'conventional-changelog-writer'
import mergeConfig from 'conventional-changelog-core/lib/merge-config'
import streamFromArray from 'stream-from-array'
import through from 'through2'
import resolvePreset from './preset-resolver'
import { parseCommit } from './common'
import type { Commit } from 'conventional-commits-parser'
import type { PluginsApi } from '@pvm/core/lib/plugins'

export enum conventionalChangelogReleaseTypes {'major', 'minor', 'patch'}

function parseCommits(commits, parserOpts): Array<ReturnType<typeof parseCommit>> {
  return commits.map(commit => {
    const rawData = `${commit.subject}\n${commit.body}`
    const parsed = parseCommit(rawData, parserOpts)

    if ('commit' in commit && commit.commit.long) {
      parsed.hash = commit.commit.long
    }

    return parsed
  })
}

const commitsCache = new Map()

function parseCommitsWithCache(commits, parserOpts): ReturnType<typeof parseCommits> {
  if (commitsCache.has(commits)) {
    return commitsCache.get(commits)
  }
  const parsed = parseCommits(commits, parserOpts)
  commitsCache.set(commits, parsed)
  return parsed
}

/**
 * Options that allowed to pass to plugin via config file
 *
 * Example
 * ```javascript
 * module.exports = {
 *  plugins: {
 *    options: {
 *      '@pvm/plugin-conventional-changelog': {
 *        ignoreReverted: false
 *      },
 *    },
 *  }
 * }
 * ```
 */
export type PluginOpts = {
  ignoreReverted?: boolean,
  preset?: string,
  config?: any,
  /**
   * Allow to customize release type choose behaviour
   *
   * .pvm.js example in which we disable version bump if all commits are of type 'chore'
   * ```javascript
   * module.exports = {
   *  update {
   *    default_release_type: 'none'
   *  },
   *  plugins: {
   *    options: {
   *      '@pvm/plugin-conventional-changelog': {
   *        whatBump: (commits) => {
   *          return commits.every(c => c.type === 'chore') ? null : { level: 2 }
   *        },
   *      },
   *    },
   *  }
   * }
   * ```
   * @param commits
   */
  whatBump?: (commits: Array<Commit>) => null | { level: conventionalChangelogReleaseTypes },
}

async function plugin(api: PluginsApi, opts: PluginOpts = {}): Promise<void> {
  const {
    ignoreReverted = true,
    preset: passedPreset,
    config: passedConfig,
  } = opts

  let presetPkg
  const preset = !passedPreset && !passedConfig ? require.resolve('./preset') : passedPreset
  if (preset) {
    try {
      presetPkg = conventionalChangelogPresetLoader(preset)
    } catch (err) {
      throw new Error(`Error loading "${preset}" conventional-changelog preset. Is it installed ?`)
    }
  }

  const config = await resolvePreset(presetPkg || passedConfig) || {}
  opts.config = config
  const mergedConfig = await mergeConfig(opts)

  const { recommendedBumpOpts = {} } = config
  const { parserOpts: recommendedParserOpts } = recommendedBumpOpts

  const parserOpts = {
    ...recommendedParserOpts,
    ...mergedConfig.parserOpts,
  }

  let releaseTypeBuilder

  api.provides(api.features.releaseTypeByCommits, gitCommits => {
    let commits = parseCommitsWithCache(gitCommits, parserOpts)
    if (ignoreReverted) {
      commits = conventionalCommitsFilter(commits)
    }

    releaseTypeBuilder = releaseTypeBuilder ?? (api.has(api.features.releaseTypeBuilder) ? api.run(api.features.releaseTypeBuilder) : false)
    // для кастомного whatBump и билдера от плагинов мы ожидаем возвращаемого значения в формате строки releaseType или 'none'
    const customWhatBump = opts.whatBump || releaseTypeBuilder
    if (customWhatBump) {
      return customWhatBump(commits)
    }

    // recommendedBumpOpts.whatBump возвращает тип релиза в формате { result: { level: 0 | 1 | 2 } }
    if (recommendedBumpOpts.whatBump) {
      const result = recommendedBumpOpts.whatBump(commits)
      if (result && result.level !== null) {
        return conventionalChangelogReleaseTypes[result.level]
      }
    }
  })

  api.provides(api.features.commitsToNotes, (commits) => {
    const commitsStream = streamFromArray.obj(parseCommitsWithCache(commits, parserOpts))
    const { writerOpts } = mergedConfig
    writerOpts.includeDetails = false

    /*
    Если репозиторий не-монорепа, то формат тегов - vX.X.X и это включает альтернативную логику включения вывода лога
    Логика включения этого флага зашита в https://github.com/conventional-changelog/conventional-changelog/blob/8076d4666c2a3ea728b95bf1e4e78d4c7189b1dc/packages/conventional-changelog-core/lib/merge-config.js#L196. Логика включения коммита в
    лог находится тут https://github.com/conventional-changelog/conventional-changelog/blob/8076d4666c2a3ea728b95bf1e4e78d4c7189b1dc/packages/conventional-changelog-writer/index.js#L147
    и видно, что если doFlush в false, то вывод лога регулируется наличием и валидностью version в объекте commit'а и
    тут есть проблемы:
    1. Код, который проставляет версию в коммит находится в секции conventional-commit-changelog'а которая вызывается
    только при генерации чейнджлога через него
    2. Pvm ставит версию в тег после генерации чейнджлога
    3. Pvm формирует релиз из всех коммитов с последнего релиза и ситуация когда может быть несколько секций в релизе - невозможна
    */
    writerOpts.doFlush = true

    return new Promise((resolve, reject) => {
      let result = ''

      const concatStream = through((chunk, _enc, cb) => {
        result += chunk
        cb()
      }, cb => {
        resolve(result)
        cb()
      })

      commitsStream
        .pipe(conventionalChangelogWriter(mergedConfig.context, writerOpts))
        .on('error', e => {
          reject(e)
        })
        .pipe(concatStream)
    })
  })

  api.provides(api.features.notifyScriptsPath, () => Promise.resolve(path.join(__dirname, 'notify-scripts')))
}

export default plugin
