---
id: summary
title: Заключение
---

Прежде чем подводить итоги, давайте суммируем как pvm может хранить версии пакетов и приведем соответствующие настройки для этого.

| `versioning.source` | место хранения версии |
| -- | -- |
| `tag` | релизный аннотированный тег вида `vX.Y.Z` или `release-<date>-<suffix>` |
| `file` | файл, который задается настройкой `versioning.source_file` <br/> по умолчанию `versions.json` |
| `package` | поле `version` в `package.json` пакетов |

Мы рассмотрели как именно pvm может хранить версии, для чего нужно выделенное версионирование и как можно задействовать то или иное версионирование в конфиге pvm.
Также научились объединять группы пакетов или все пакеты сразу одной версией.
В следующей главы мы подробно рассмотрим принципы создания релизного тега.