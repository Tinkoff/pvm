import path from 'path'
import { EventEmitter } from 'events'
import chalk from 'chalk'
import { log, logger } from '../logger'
import pEachSeries from 'p-each-series'
import resolveFrom from 'resolve-from'
import { requireDefault } from '../interop'
import markdownifyCommits from '../markdownify-commits'
import { getConfig } from '../config'
import { releaseMark } from '../consts'
import { mema } from '../memoize'
import { resolvePvmProvider } from './provider'

import type { Commit, PvmReleaseType, SemverReleaseType } from '@pvm/types'
import type { Pkg } from '../pkg'
import type { ChangedContext } from '@pvm/update/lib/changed-context'
import type { VcsPlatform } from '@pvm/vcs/lib'
import type { ReleaseContext } from '@pvm/update/types'
import type { ReleaseData, ReleaseDataExt } from '@pvm/releases/types'
import type { VcsRelease } from '@pvm/vcs/types'

import type { UpdateState } from '@pvm/update/lib/update-state'

type PipelineFn<R = any> = (...args: any[]) => Promise<R>
const pipelines: Record<string, Array<PipelineFn>> = Object.create(null)
const providers = Object.create(null)

export const features = {
  commitsToNotes: 'commits-to-notes',
  preReleaseHook: 'pre-release-hook',
  releaseTypeByCommits: 'release-type-by-commits',
  releaseTypeBuilder: 'release-type-builder',
  releaseType: 'release-type',
  releaseInfoFromReleaseCtx: 'release-info-from-release-ctx',
  releaseInfoFromVcs: 'release-info-from-vcs',
  attributeReleaseData: 'attribute-release-data',
  notifyScriptsPath: 'notify-scripts-path',
}

const featureDefaults = {
  [features.commitsToNotes]: (commits, _maybePkg, config) => markdownifyCommits(commits, { jiraUrl: config.jira.url }),
}

type AnyFunc = any

interface Features {
  [key: string]: AnyFunc, // @TODO
}

export interface PluginsApi {
  features: typeof features,
  cwd: string,
  provides<K extends keyof Features>(feature: K, impl: Features[K]): void,
  provideRecord(ns: string, rec: Partial<Features>): void,
  provideClass(ns: string, rec: Partial<Features>): void,
  getDefaultImpl<K extends keyof Features>(feature: K): Features[K],
  getOr<K extends keyof Features, D>(feature: K, defaultIml: D): Features[K] | D,
  has<K extends keyof Features>(feature: K): boolean,
  resolve<K extends keyof Features>(feature: K): Features[K],
  run<K extends keyof Features>(feature: K, ...args: any[]): ReturnType<Features[K]>,
  runOr<K extends keyof Features, D>(feature: K, defaultValue: D, ...args: any[]): ReturnType<Features[K]> | D,
  addPipeline<R = any>(name: string, fn: PipelineFn<R>): void,
  plPipe<D>(name: string, initialValue: D, ...args: any[]): Promise<any>,
  plEachSeries(name: string, ...args: any[]): Promise<any>,
}

export interface HostApi extends PluginsApi {
  commitsToNotes(commits: Commit[], maybePkg?: Pkg | void): Promise<string>,
  releaseTypeByCommits(commits: Commit[], defaultValue?: SemverReleaseType | null): Promise<SemverReleaseType | null>,
  releaseType(pkg: Pkg, changedContext: ChangedContext): Promise<PvmReleaseType>,
  preReleaseHook(vcs: VcsPlatform, releaseContext: ReleaseContext): Promise<void>,
  releaseInfoFromReleaseCtx(releaseData: ReleaseData, releaseContext: ReleaseContext): Promise<ReleaseDataExt>,
  releaseInfoFromVcs(releaseData: ReleaseData, vcsRelease: VcsRelease): Promise<ReleaseDataExt>,
  attributeReleaseData(releaseData: ReleaseData, updateState: UpdateState | null): Promise<ReleaseDataExt>,
  notifyScriptsPath(): Promise<string>,
}

type PluginsContext = {
  hostApi: HostApi,
  pluginsApi: PluginsApi,
  lazyLoadPluginsOnce: () => Promise<void>,
}

function filterPluginsFromDeps(deps: Record<string, string> = {}): string[] {
  const pluginsToLoad: string[] = []

  for (const depName of Object.keys(deps)) {
    const [, unscopedDepName = ''] = depName.split('/')
    if (
      depName.startsWith('pvm-plugin') ||
      depName.startsWith('@pvm/plugin') ||
      unscopedDepName.startsWith('pvm-plugin')
    ) {
      pluginsToLoad.push(depName)
    }
  }

  return pluginsToLoad
}

function makePluginsContext(cwd: string): PluginsContext {
  const pluginsApi: PluginsApi = Object.assign(new EventEmitter(), {
    features,
    cwd,
    provides<T>(feature: keyof Features, impl: T) {
      if (!providers[feature]) {
        providers[feature] = impl
      }
    },
    provideRecord<T extends Record<string, any>>(ns: string, rec: T) {
      for (const [key, val] of Object.entries(rec)) {
        const boundVal = typeof val === 'function' ? val.bind(rec) : val
        this.provides(`${ns}.${key}`, boundVal)
      }
    },
    provideClass<T extends Record<string, any>>(ns: string, cls: T) {
      this.provides(ns, cls)
    },
    getDefaultImpl(feature) {
      return featureDefaults[feature]
    },
    getOr(feature, defaultImpl) {
      return feature in providers ? providers[feature] : defaultImpl
    },
    has(feature): boolean {
      return feature in providers
    },
    resolve(feature) {
      let impl = this.getOr(feature, this.getDefaultImpl(feature))
      if (!impl) {
        const [ns, method] = feature.split('.')
        const cls = this.getOr(ns, undefined)
        if (!cls) {
          throw new Error(`there is no ${feature} feature`)
        }

        impl = cls[method]
        if (!impl) {
          throw new Error(`there is no method "${method}" in class "${cls.name}"`)
        }
        impl = impl.bind(cls)
      }
      return impl
    },
    run(feature, ...args) {
      return this.resolve(feature)(...args)
    },
    runOr(feature, defaultValue, ...args) {
      const impl = this.getOr(feature, void 0)
      if (impl === void 0) {
        return defaultValue
      }
      return impl(...args)
    },
    addPipeline<R = any>(name, fn: PipelineFn<R>) {
      pipelines[name] = pipelines[name] || []
      pipelines[name].push(fn)
    },
    async plPipe(name, initialValue, ...args) {
      const pipelineFns = pipelines[name] || []
      if (pipelineFns.length === 0) {
        return initialValue
      }

      let currentValue = initialValue
      for (const fn of pipelineFns) {
        currentValue = await fn(currentValue, ...args)
      }

      return currentValue
    },
    async plEachSeries(name, ...args) {
      const pipelineFns = pipelines[name] || []

      for (const fn of pipelineFns) {
        await fn(...args)
      }
    },
  })

  async function loadPlugin(plugin, name: string): Promise<void> {
    const config = await getConfig(cwd)
    const opts = config.plugins.options[name]

    await plugin(pluginsApi, opts)
    log(chalk`plugin {blue ${name}} loaded`)
  }

  async function loadPluginByName(name: string, resolveFromPath: string = cwd): Promise<void> {
    const plugin = requireDefault(resolveFrom(resolveFromPath, name))
    await loadPlugin(plugin, name)
  }

  async function loadProvidedPlugins(): Promise<unknown> {
    const config = await getConfig(cwd)
    const provider = resolvePvmProvider(config.configLookupDir)
    if (!provider) {
      return
    }
    const pluginsToLoad = filterPluginsFromDeps(provider.pkg.dependencies)

    return pEachSeries(pluginsToLoad, async (name) => loadPluginByName(name, provider.path))
  }

  async function loadLocalPlugins(): Promise<void> {
    const config = await getConfig(cwd)
    const { local_plugins = [] } = config.plugins
    for (const localPluginPath of local_plugins) {
      const resolvedPath = path.resolve(config.configLookupDir, localPluginPath)
      const pluginName = localPluginPath.replace(/\.js$/, '')

      await loadPlugin(requireDefault(resolvedPath), pluginName)
    }
  }

  async function loadPlugins(): Promise<void> {
    await loadProvidedPlugins()
    await loadLocalPlugins()
    await loadPluginsFromDeps()
  }

  async function loadPluginsFromDeps(): Promise<unknown> {
    const config = await getConfig(cwd)
    const pluginsConfig = config.plugins
    const { load_first = [] } = pluginsConfig

    const rootPkgPath = path.join(config.configLookupDir, 'package.json')
    let pkg
    try {
      pkg = requireDefault(rootPkgPath)
    } catch (e) {
      return
    }

    const deps = {
      ...(pkg.dependencies || {}),
      ...(pkg.devDependencies || {}),
    }

    const pluginsToLoad = filterPluginsFromDeps(deps)

    pluginsToLoad.sort((a, b) => {
      const aFirstIndex = load_first.indexOf(a)
      const bFirstIndex = load_first.indexOf(b)
      if (aFirstIndex === -1 && bFirstIndex === -1) {
        return 0
      }
      if (aFirstIndex === -1) {
        return 1
      }
      if (bFirstIndex === -1) {
        return -1
      }

      return aFirstIndex - bFirstIndex
    })

    return pEachSeries(pluginsToLoad, async (name) => loadPluginByName(name, config.configLookupDir))
  }

  let pluginsWillBeReady
  async function lazyLoadPluginsOnce(): Promise<void> {
    if (!pluginsWillBeReady) {
      pluginsWillBeReady = loadPlugins()
    }
    await pluginsWillBeReady
  }

  const hostApi: HostApi = Object.assign(Object.create(pluginsApi), {
    async commitsToNotes(commits, maybePkg: Pkg | void = void 0) {
      const config = await getConfig(cwd)
      const filteredCommits = commits.filter(commit => {
        return commit.subject.indexOf('[pvm noshow]') === -1 && commit.body.indexOf(releaseMark) === -1
      })
      const releaseNotes = await this.run(features.commitsToNotes, filteredCommits, maybePkg, config)
      return this.plPipe('release-notes', releaseNotes)
    },
    releaseTypeByCommits(commits: Commit[], defaultValue = null) {
      return this.runOr(features.releaseTypeByCommits, defaultValue, commits)
    },
    async releaseType(pkg: Pkg, changedContext: ChangedContext): Promise<PvmReleaseType | undefined> {
      return this.runOr(features.releaseType, void 0, pkg, changedContext)
    },
    async preReleaseHook(vcs: VcsPlatform, releaseContext: ReleaseContext) {
      return this.plEachSeries(features.preReleaseHook, vcs, releaseContext)
    },
    async releaseInfoFromReleaseCtx(releaseData: ReleaseData, releaseContext: ReleaseContext): Promise<ReleaseDataExt> {
      logger.deprecate('releaseInfoFromVcs is DEPRECATED. Please use attributeReleaseData method')
      return this.attributeReleaseData(releaseData, releaseContext.updateState)
    },
    async releaseInfoFromVcs(releaseData: ReleaseData, _not_used: any = void 0): Promise<ReleaseDataExt> {
      logger.deprecate('releaseInfoFromVcs is NOOP. Please use attributeReleaseData method')
      return releaseData
    },
    async attributeReleaseData(releaseData: ReleaseData, updateState: UpdateState | null): Promise<ReleaseDataExt> {
      return this.plPipe(features.attributeReleaseData, releaseData, updateState)
    },
    async notifyScriptsPath(): Promise<string> {
      return this.runOr(features.notifyScriptsPath)
    },
  })

  return {
    hostApi,
    pluginsApi,
    lazyLoadPluginsOnce,
  }
}

const pluginsContextLazy = mema(makePluginsContext)

export async function getHostApi(cwd: string = process.cwd()): Promise<HostApi> {
  const context = pluginsContextLazy(cwd)
  await context.lazyLoadPluginsOnce()
  return context.hostApi
}
