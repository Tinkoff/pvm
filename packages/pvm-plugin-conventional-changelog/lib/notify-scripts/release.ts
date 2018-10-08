import type { ReleasedProps } from '@pvm/core/types/publish'
import type { Message } from '@pvm/types'
import { releaseMessage } from '../message-builder'

process.on('message', async (releaseProps: ReleasedProps) => {
  const message: Message = await releaseMessage(releaseProps, {
    attachPackages: false,
  })

  process.send!({
    type: 'message',
    message,
  })

  process.exit(0)
})
