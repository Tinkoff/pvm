# @pvm/notifications

Module used to send messages into specified messengers

## [Configuration](../interfaces/pvm_core.Config.md#notifications)

Configuration [defaults](../interfaces/pvm_core.Config.md#notifications) provide values
that will be used as defaults for message when `sendMessage` called.

## Node API

Main api entry point is [Notificator](../classes/pvm_notifications.Notificator) class. It's interface
public methods are appear to be public api.

Example
```typescript
import { Notificator } from '@pvm/notifications'

async function send(channel: string, content: string) {
  const notificator = await Notificator.create()
  notificator.sendMessage({
    channel,  
    content
  })
}
```

## CLI

@cli-inline yarn pvm notification --help

### `pvm notification send`
@cli-inline yarn pvm notification send --help

