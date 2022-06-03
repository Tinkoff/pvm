# @pvm/slack

Provides client for `slack` messenger. Client implementing [AbstractMessengerClient](api/classes/pvm_notifications.AbstractMessengerClient.md).

## Enabling in project

`.pvm.toml`
```toml
...
[[notifications.clients]]
name = 'slack'
pkg = '@pvm/slack'
```
After that, depending on settings [нотификаций](api/interfaces/pvm_core.Config.md#notifications), messages will be sending to `slack` messenger