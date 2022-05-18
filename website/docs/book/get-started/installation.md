---
id: installation
title: Установка
---

## Требования

* [Node.js](https://nodejs.org/en/download/) version >= 10.15.1 или выше.
* [git](https://git-scm.com/book/en/v2/Getting-Started-Installing-Git) какой-нибудь свежей версии.

## Установка npm пакета

import Tabs from '@theme/Tabs'
import TabItem from '@theme/TabItem'

<Tabs
  defaultValue='yarn'
  values={ [{label: 'Yarn', value: 'yarn'}, {label: 'NPM', value: 'npm'}] }
>
<TabItem value="yarn">

```bash
yarn add @pvm/pvm --dev
```

</TabItem>
<TabItem value="npm">

```bash
npm install -D @pvm/pvm
```

</TabItem>
</Tabs>

Если в проекте  используется [conventional commits](https://www.conventionalcommits.org/en/v1.0.0/),
то нужно еще установить плагин командой `yarn add -D -W @pvm/plugin-conventional-changelog`.

## Проверка установки

Для удобства использования можно использовать `yarn` для запуска pvm команд в репозитории:

```bash
yarn -s pvm pkgset
```
