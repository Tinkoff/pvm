# @pvm/plugin-http-proxy

Includes the [global-agent](https://www.npmjs.com/package/global-agent) library which overrides
standard http(s) nodejs clients and adds proxy support to them.

Configurable with [environment variables](https://www.npmjs.com/package/global-agent#environment-variables).
Namespace at initialization we specify as empty, so variable names do not contain a prefix
`${NAMESPACE}_` as in the documentation above.