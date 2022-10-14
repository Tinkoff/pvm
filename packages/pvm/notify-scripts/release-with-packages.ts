// This file refers to those that you can freely copy to your own project.
import type { ReleasedProps } from '@pvm/types'
import { releaseMessage } from '@pvm/lib-core'

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
