---
id: release-notes
title: Описание релиза
---

Описание релиза формируется на основе коммитов сделанных со времени последнего релиза.

import ReleaseNotesSvg from '../_assets/release-notes.svg'

<ReleaseNotesSvg />

## Встроенное преобразование

pvm имеет встроенное преобразования коммитов в текст для release notes.

Во первых все коммиты преобразуются в markdown-список, если их было больше одного.
Т.е. если у нас в репозитории было два коммита после последнего релиза, например

1. `added .toml support for config files`
1. `got rid of flickering while changing screen resolution`

То release notes будет сформирован на основе этих коммитов в обычный markdown список:

```markdown
- added .toml support for config files
- got rid of flickering while changing screen resolution
```

Во вторых, удаляются сервисные префиксы `fix:`, `patch:` и `BREAKING CHANGE:` с начала каждого коммита при наличии.

Кроме того, если у вас указана настройка `jira.url` то весь текст вида ABC-123 будет преобразован в ссылку на jira-задачу.
Например, если `jira.url` равен `https://jira.com` то текст `MBPRO-4112` будет преобразован в makrdown-ссылку `[MBPRO-4112](https://jira.com/browse/MBPRO-4112)`.

## conventional-commits

В качестве альтернативы есть спецификация и реализация [conventional-commits](https://www.conventionalcommits.org/en/v1.0.0/) и по способу именования коммитов, и также по формированию текста/ченжлога на базе них.
Pvm ее тоже поддерживает, через плагин `@pvm/plugin-conventional-changelog`, достаточно его установить:

```markdown
yarn add @pvm/plugin-conventional-changelog --dev
```

Плагин при этом подключиться автоматически, нигде прописывать допольнительно после установки его не нужно.

В случае установки данного плагина, вычисление типа релиза пакетов, а также преобразование коммитов в release notes возьмут на себя
библиотеки из [группы пакетов conventional-commits](https://github.com/conventional-changelog/conventional-changelog/tree/master/packages).

Подробнее про настройку плагина conventional-commits смотри [здесь TODO].

## Свой вариант

Можно по своему настроить преобразование коммитов в release notes, делается это через написание своего плагина, но это тема отдельной [главы].