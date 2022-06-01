# @pvm/mattermost

A client for  `mattermost` messenger. Client implementing [AbstractMessengerClient](api/classes/pvm_notifications.AbstractMessengerClient.md).

## Required environment variables

`PVM_MATTERMOST_TOKEN` и `PVM_MATTERMOST_URL` - for sending message via REST API

`PVM_MATTERMOST_INCOMING_WEBHOOK` - for sending via [incoming webhooks](https://docs.mattermost.com/developer/webhooks-incoming.html)

## Enabling in project

`.pvm.toml`
```toml
...
[[notifications.clients]]
name = 'mattermost'
pkg = '@pvm/mattermost'
```
After that, depending on [notifications settings](api/interfaces/pvm_core.Config.md#notifications), messages will be sending to `mattermost` messenger