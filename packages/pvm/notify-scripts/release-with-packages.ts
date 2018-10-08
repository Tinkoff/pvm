// This file refers to those that you can freely copy to your own project.
import type { ReleasedProps } from '../types'
import { releaseMessage } from '../lib/message-builder'

process.on('message', (releaseProps: ReleasedProps) => {
  const message = releaseMessage(releaseProps, {
    attachPackages: true,
  })

  process.send!({
    type: 'message',
    message,
  })
  process.exit(0)
})
