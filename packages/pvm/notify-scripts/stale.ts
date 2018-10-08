// This file refers to those that you can freely copy to your own project.
import type { ReleasedProps } from '../types'
import { buildMessage } from '../lib/message-builder'

process.on('message', (releaseProps: ReleasedProps) => {
  const message = buildMessage(releaseProps, {
    bodyWrapper: (_body, { releaseLink, releaseName, registry }) => {
      const header = `Publish stale packages for ${releaseLink || releaseName} for ${registry || 'default'} registry`

      return `${header}`
    },
    attachPackages: true,
  })

  process.send!({
    type: 'message',
    message,
  })
  process.exit(0)
})
