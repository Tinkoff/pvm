---
id: eneedauth
title: ENEEDAUTH
---

## Error

Publication failure:

```
Error: Command "npm publish ./package --tag latest --registry https://registry.npmjs.org/ --unsafe-perm"
...
npm ERR! code ENEEDAUTH
npm ERR! need auth This command requires you to be logged in to https://registry.npmjs.org/
npm ERR! need auth You need to authorize this machine using `npm adduser`   
```

## Reason

In Node.js after 18.14.0 version npm was upgraded to major 9.3.1 version - https://github.com/nodejs/node/blob/main/doc/changelogs/CHANGELOG_V18.md#auth, which broke authorization logic in pvm

## Solution

Stick to  18.13 node version - `node:18.13.0` until https://github.com/Tinkoff/pvm/issues/75
