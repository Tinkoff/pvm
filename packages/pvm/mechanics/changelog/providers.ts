import { provide, createToken } from '../../lib/di'
import ListRenderer from './md/list'
import ListWithPackagesRenderer from './md/list-with-packages'
import type { IncrementalRenderer } from './types'
import { CHANGELOG_CUSTOM_RENDERER, CHANGELOG_RENDERERS_MAP } from '../../tokens'

export const CHANGELOG_BUILTIN_LIST_RENDERER = createToken<IncrementalRenderer>('CHANGELOG_RENDERER')
export const CHANGELOG_BUILTIN_LIST_WITH_PACKAGES_RENDERER = createToken<IncrementalRenderer>('CHANGELOG_BUILTIN_LIST_WITH_PACKAGES_RENDERER')

export default [
  provide({
    provide: CHANGELOG_BUILTIN_LIST_RENDERER,
    useClass: ListRenderer,
  }),
  provide({
    provide: CHANGELOG_BUILTIN_LIST_WITH_PACKAGES_RENDERER,
    useClass: ListWithPackagesRenderer,
  }),
  provide({
    provide: CHANGELOG_RENDERERS_MAP,
    useFactory({
      listRenderer,
      listWithPackagesRenderer,
      customRenderer,
    }) {
      return {
        'builtin.list': listRenderer,
        'builtin.list-with-packages': listWithPackagesRenderer,
        'custom': customRenderer,
      }
    },
    deps: {
      listRenderer: CHANGELOG_BUILTIN_LIST_RENDERER,
      listWithPackagesRenderer: CHANGELOG_BUILTIN_LIST_WITH_PACKAGES_RENDERER,
      customRenderer: { token: CHANGELOG_CUSTOM_RENDERER, optional: true },
    },
  }),
]
