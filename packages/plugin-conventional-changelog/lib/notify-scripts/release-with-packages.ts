import type { ReleasedProps, Message } from '@pvm/pvm'

import { releaseMessage } from '../message-builder'

process.on('message', async (releaseProps: ReleasedProps) => {
  const message: Message = await releaseMessage(releaseProps, {
    attachPackages: true,
  })

  process.send!({
    type: 'message',
    message,
  })

  process.exit(0)
})
