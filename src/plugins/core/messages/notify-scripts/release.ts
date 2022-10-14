// This file refers to those that you can freely copy to your own project.
import type { ReleasedProps } from '@pvm/types'
import { releaseMessage } from '../message-builder'

process.on('message', (releaseProps: ReleasedProps) => {
  const message = releaseMessage(releaseProps, {
    attachPackages: false,
  })

  process.send!({
    type: 'message',
    message,
  })
  process.exit(0)
})
