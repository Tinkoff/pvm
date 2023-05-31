import type { ReleasedProps, Message } from '../../types'

import type { Container } from '../../lib/di'
import { RELEASE_NOTIFICATIONS_MAP_TOKEN } from '../../tokens'

interface NotifyOpts {
  notificationName?: string,
  strategy?: string,
}

export async function releaseMessage(di: Container, releasedProps: ReleasedProps, opts: NotifyOpts): Promise<Message> {
  const { strategy } = opts
  const notificationBuildersList = di.get(RELEASE_NOTIFICATIONS_MAP_TOKEN)!.reduce((acc, m) => Object.assign(acc, m), {})

  const {
    notificationName = strategy === 'stale' ? 'stale' : 'release',
  } = opts

  if (!notificationBuildersList[notificationName]) {
    throw new Error(`Notificator "${notificationBuildersList[notificationName]}" is not listed in notificators map. Inspect provided RELEASE_NOTIFICATIONS_MAP_TOKEN and check provider notificatorName for correctness.`)
  }

  return notificationBuildersList[notificationName](releasedProps)
}
