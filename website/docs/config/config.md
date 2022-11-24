---
id: configuration
title: Configuration
---

## [Config schema](api/interfaces/pvm_pvm.Config.md)


## Configuration sources
### Project-level configuration file
Config file name should be `.pvm` and extension should be one of the following: `.json`, `.json5`, `.toml`, `.yaml` or `.js` if configuration
should be dynamically calculated.

.toml example
```toml
[versioning]
unified = true
source = 'tag'
```

.js example
```js
module.exports = {  
  // config goes here
}
```

### [Default builtin values](config/config-defaults.md)

### Env variables with `PVM_CONFIG_` prefix
For each variable prefix will be remove and rest part of name will be transformed to lower case. Double dashes `__` will be converted to `.` in result path.

Example:
Env `PVM_CONFIG_PUBLISH__CLI_ARGS` will set value in config by following path `publish.cli_args`

### Plugins with config extension

Example:
```typescript
import { declarePlugin } from '@pvm/di'

export default declarePlugin({
  configExt: {
    mark_pr: {
      analyze_update: true,
    },
  },
})

```

## Sources priority (from most prioritized)
* Env variables with `PVM_CONFIG_` prefix
* Project-level configuration file
* Plugins with CONFIG_EXTENSION_TOKEN provider
* Default builtin values
