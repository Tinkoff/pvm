# @pvm/mattermost

Предоставляет клиент для мессенджера `mattermost`. Клиент реализует интерфейс [AbstractMessengerClient](api/classes/pvm_notifications.AbstractMessengerClient.md).

## Подключение в проекте

`.pvm.toml`
```toml
...
[[notifications.clients]]
name = 'mattermost'
pkg = '@pvm/mattermost'
```
После этого, в зависимости от настроек [нотификаций](api/interfaces/pvm_core.Config.md#notifications), сообщения будут отправляться
в мессенджер `mattermost`