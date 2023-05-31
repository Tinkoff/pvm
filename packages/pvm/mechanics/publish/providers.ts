import { provide } from '../../lib/di'
import { RELEASE_NOTIFICATIONS_MAP_TOKEN } from '../../tokens'
import type { ReleasedProps } from '../../types'
import { buildMessage, releaseMessage } from '../../lib/messages/message-builder'

export default [
  provide({
    provide: RELEASE_NOTIFICATIONS_MAP_TOKEN,
    useValue: {
      release: (releaseProps: ReleasedProps) => Promise.resolve(releaseMessage(releaseProps, {
        attachPackages: false,
      })),
      releaseWithPackages: (releaseProps: ReleasedProps) => Promise.resolve(releaseMessage(releaseProps, {
        attachPackages: true,
      })),
      stale: (releaseProps: ReleasedProps) => Promise.resolve(buildMessage(releaseProps, {
        bodyWrapper: (_body, { releaseLink, releaseName, registry }) => {
          const header = `Publish stale packages for ${releaseLink || releaseName} for ${registry || 'default'} registry`

          return `${header}`
        },
        attachPackages: true,
      })),
    },
  }),
]
