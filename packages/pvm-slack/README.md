# @pvm/slack

Предоставляет клиент для мессенджера `slack`. Клиент реализует интерфейс [AbstractMessengerClient](api/classes/pvm_notifications.AbstractMessengerClient.md).

## Подключение в проекте

`.pvm.toml`
```toml
...
[[notifications.clients]]
name = 'slack'
pkg = '@pvm/slack'
```
После этого, в зависимости от настроек [нотификаций](api/interfaces/pvm_core.Config.md#notifications), сообщения будут отправляться
в мессенджер `slack`