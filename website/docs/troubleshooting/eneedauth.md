---
id: eneedauth
title: ENEEDAUTH
---

## Ошибка

Ошибка при публикации пакетов:

```
Error: Command "npm publish ./package --tag latest --registry https://registry.npmjs.org/ --unsafe-perm"
...
npm ERR! code ENEEDAUTH
npm ERR! need auth This command requires you to be logged in to https://registry.npmjs.org/
npm ERR! need auth You need to authorize this machine using `npm adduser`   
```

## Причина

В Node.js 18 версии обновили npm до версии 9.3.1 - https://github.com/nodejs/node/blob/main/doc/changelogs/CHANGELOG_V18.md#auth, что сломало авторизацию при публикации

## Решение

До решения проблемы на стороне pvm зафиксируйте образ Node.js для публикации на 18.13 версии - `node:18.13.0`
